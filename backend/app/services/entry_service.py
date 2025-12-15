import io
import json
from typing import Protocol, Sequence, TypeVar
from uuid import UUID, uuid4

from cvsx2mvsx.models.internal.entry import InternalEntry
from fastapi import BackgroundTasks, Depends, HTTPException, UploadFile, status
from minio import S3Error
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings.api_settings import get_api_settings
from app.core.settings.minio_settings import get_minio_settings
from app.database.models.entry_model import Entry
from app.database.models.share_link_model import ShareLink
from app.database.models.user_model import User
from app.database.session_manager import get_async_session
from app.repositories.entry_repository import EntryRepository
from app.repositories.share_link_repository import ShareLinkRepository
from app.services.processing_service import ProcessingService
from app.services.storage_service import get_minio_client


class HasSourcePath(Protocol):
    source_filepath: str


T = TypeVar("T", bound=HasSourcePath)


class EntryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.entry_repo = EntryRepository(session)
        self.share_link_repo = ShareLinkRepository(session)
        self.minio = get_minio_client()

    async def create_entry(
        self,
        *,
        user: User,
        dataset_file: UploadFile,
        background_tasks: BackgroundTasks,
        lattice_to_mesh: bool = True,
    ) -> Entry:
        dataset_id = uuid4()
        storage_key_prefix = f"datasets/{dataset_id}"
        raw_storage_key = f"temp/{dataset_id}.cvsx"

        # Check storage quota
        current_usage = await self.entry_repo.get_storage_usage(user.id)
        upload_size = dataset_file.size if dataset_file.size else 0
        max_size = get_api_settings().STORAGE_MAX_UPLOAD_SIZE

        if upload_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size of {max_size / (1024**3):.2f} GB",
            )
        if current_usage + upload_size > user.storage_quota:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Storage quota exceeded.",
            )

        # Upload CVSX input data
        try:
            self.minio.put_object(
                bucket_name=get_minio_settings().MINIO_BUCKET,
                object_name=raw_storage_key,
                data=dataset_file.file,
                length=dataset_file.size if dataset_file.size else -1,
                part_size=10 * 1024 * 1024,
                content_type="application/octet-stream",
            )
        except S3Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Storage error: {e}",
            )

        # Create DB Entry
        entry = Entry(
            id=dataset_id,
            name=dataset_file.filename or "data.cvsx",
            storage_key=storage_key_prefix,
            size_bytes=upload_size,
            owner_id=user.id,
        )
        self.entry_repo.add(entry)

        share_link = ShareLink(entry_id=entry.id)
        self.share_link_repo.add(share_link)

        await self.entry_repo.commit()
        await self.entry_repo.refresh(entry, attribute_names=["link"])

        # Schedule processing
        background_tasks.add_task(
            ProcessingService.process_entry_conversion,
            entry_id=entry.id,
            cvsx_storage_key=raw_storage_key,
            internal_storage_key_prefix=storage_key_prefix,
            lattice_to_mesh=lattice_to_mesh,
        )

        return entry

    async def get_entry_by_id(
        self,
        *,
        entry_id: UUID,
        user: User | None,
    ) -> Entry:
        entry = await self.entry_repo.get_with_links(entry_id)

        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entry not found",
            )
        if user and entry.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this entry",
            )

        return entry

    async def get_entry_share_link(
        self,
        *,
        entry_id: UUID,
        user: User,
    ) -> ShareLink:
        # First verify access using get_entry_by_id
        await self.get_entry_by_id(
            entry_id=entry_id,
            user=user,
        )

        share_link = await self.share_link_repo.get_by_entry_id(entry_id)

        if not share_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Share link for entry not found",
            )

        return share_link

    async def list_user_entries(
        self,
        user_id: UUID,
        page: int,
        per_page: int,
        sort_by: str,
        sort_order: str,
    ) -> tuple[Sequence[Entry], int]:
        total_items = await self.entry_repo.count_by_owner(user_id)

        descending = sort_order == "desc"
        offset = (page - 1) * per_page

        items = await self.entry_repo.list_by_owner(
            owner_id=user_id,
            offset=offset,
            limit=per_page,
            sort_attr=sort_by,
            descending=descending,
        )

        return items, total_items

    async def get_internal_model(
        self,
        *,
        entry_id: UUID,
        user: User | None,
    ) -> InternalEntry:
        entry = await self.get_entry_by_id(entry_id=entry_id, user=user)

        object_path = f"{entry.storage_key}/internal.json"

        try:
            response = self.minio.get_object(
                bucket_name=get_minio_settings().MINIO_BUCKET,
                object_name=object_path,
            )
            data = json.load(response)
            response.close()
            response.release_conn()
            return InternalEntry.model_validate(data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Internal model not found: {str(e)}",
            )

    async def update_entry(
        self,
        *,
        entry_id: UUID,
        user: User | None,
        name: str | None,
        title: str | None,
        description: str | None,
    ) -> Entry:
        entry = await self.get_entry_by_id(
            entry_id=entry_id,
            user=user,
        )

        if name is not None:
            entry.name = name
        if title is not None:
            entry.title = title
        if description is not None:
            entry.description = description

        await self.entry_repo.commit()
        await self.entry_repo.refresh(entry)
        return entry

    async def update_internal_model(
        self,
        *,
        entry_id: UUID,
        user: User,
        model: InternalEntry,
    ) -> InternalEntry:
        entry = await self.get_entry_by_id(entry_id=entry_id, user=user)

        object_path = f"{entry.storage_key}/internal.json"

        try:
            model_bytes = model.model_dump_json(indent=2).encode("utf-8")
            data_stream = io.BytesIO(model_bytes)

            self.minio.put_object(
                bucket_name=get_minio_settings().MINIO_BUCKET,
                object_name=object_path,
                data=data_stream,
                length=len(model_bytes),
                content_type="application/json",
            )
            return model
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update internal model: {str(e)}",
            )

    async def delete_entry(
        self,
        *,
        entry_id: Entry,
        user: User,
    ) -> None:
        entry = await self.get_entry_by_id(
            entry_id=entry_id,
            user=user,
        )

        try:
            self.minio.remove_object(
                bucket_name=get_minio_settings().MINIO_BUCKET,
                object_name=entry.storage_key,
            )
        except S3Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting file from MinIO: {e}",
            )

        await self.entry_repo.delete(entry)
        await self.entry_repo.commit()


async def get_entry_service(
    session: AsyncSession = Depends(get_async_session),
) -> EntryService:
    return EntryService(
        session=session,
    )
