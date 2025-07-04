from uuid import UUID, uuid4

from fastapi import Depends, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.contracts.responses.volseg_responses import VolsegEntryResponse
from app.database.models.user_model import User
from app.database.models.volseg_entry_model import VolsegEntry
from app.database.session_manager import get_async_session
from app.services.files.base_storage import BaseStorage
from app.services.files.minio_storage import get_minio_storage


class VolsegService:
    def __init__(
        self,
        session: AsyncSession,
        storage: BaseStorage,
    ):
        self.session = session
        self.storage = storage

    async def create(
        self,
        *,
        user: User,
        name: str,
        is_public: bool,
        cvsx_file: UploadFile,
    ) -> VolsegEntryResponse:
        entry_id = uuid4()

        base_path = self._get_base_file_path(
            user_id=user.id,
            entry_id=entry_id,
        )
        file_path = f"{base_path}/{cvsx_file.filename}"
        file_data = cvsx_file.file
        await self.storage.save(
            file_path=file_path,
            file_data=file_data,
        )

        volseg_entry = VolsegEntry(
            id=entry_id,
            name=name,
            is_public=is_public,
            cvsx_filepath=file_path,
            user=user,
        )

        self.session.add(volseg_entry)
        await self.session.commit()

        return VolsegEntryResponse.model_validate(volseg_entry)

    async def get_entry_by_id(
        self,
        user: User | None,
        volseg_entry_id: UUID,
    ) -> VolsegEntryResponse:
        volseg_entry: VolsegEntry = await self._get_volseg_entry_by_id(volseg_entry_id)

        self._check_permissions(volseg_entry, user)

        return VolsegEntryResponse.model_validate(volseg_entry)

    async def list_public_entries(self) -> list[VolsegEntryResponse]:
        result = await self.session.execute(
            select(VolsegEntry).where(VolsegEntry.is_public == True),
        )
        entries: list[VolsegEntry] = result.scalars().all()
        return [VolsegEntryResponse.model_validate(entry) for entry in entries]

    async def list_user_entries(self, user: User) -> list[VolsegEntryResponse]:
        result = await self.session.execute(
            select(VolsegEntry).where(VolsegEntry.user_id == user.id),
        )
        volseg_entries: list[VolsegEntry] = result.scalars().all()
        return [VolsegEntryResponse.model_validate(entry) for entry in volseg_entries]

    async def get_file(
        self,
        *,
        id: UUID,
        user: User,
    ) -> UUID:
        volseg_entry: VolsegEntry = await self._get_volseg_entry_by_id(id)

        self._check_permissions(volseg_entry, user)

        if not volseg_entry.cvsx_filepath:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Missing file for volseg entry",
            )

        try:
            file = await self.storage.get(
                file_path=volseg_entry.cvsx_filepath,
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"{e}",
            )

        return Response(
            content=file,
            media_type="application/zip",
        )

    async def delete(
        self,
        user: User,
        id: UUID,
    ) -> UUID:
        volseg_entry: VolsegEntry = await self._get_volseg_entry_by_id(id)

        self._check_permissions(volseg_entry, user)

        base_path = self._get_base_file_path(
            user_id=user.id,
            entry_id=volseg_entry.id,
        )
        await self.storage.delete_directory(prefix=base_path)

        # Delete view
        await self.session.delete(volseg_entry)
        await self.session.commit()

        return volseg_entry.id

    def _get_base_file_path(
        self,
        user_id: str,
        entry_id: str,
    ) -> str:
        return f"/users/{user_id}/entries/{entry_id}"

    async def _get_volseg_entry_by_id(self, id: UUID) -> VolsegEntry:
        volseg_entry: VolsegEntry | None = await self.session.get(VolsegEntry, id)
        if volseg_entry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="View not found",
            )
        return volseg_entry

    async def _check_permissions(self, volseg_entry: VolsegEntry, user: User | None) -> None:
        if not volseg_entry.is_public and not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Entry is not public",
            )
        if volseg_entry.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Don't have access to entry",
            )


async def get_volseg_service(
    session: AsyncSession = Depends(get_async_session),
    storage: BaseStorage = Depends(get_minio_storage),
) -> VolsegService:
    return VolsegService(
        session=session,
        storage=storage,
    )
