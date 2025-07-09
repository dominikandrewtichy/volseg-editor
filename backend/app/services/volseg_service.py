import json
from io import BytesIO
from typing import BinaryIO, Literal
from uuid import UUID, uuid4
from zipfile import BadZipFile, ZipFile

from fastapi import Depends, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.contracts.responses.volseg_responses import (
    Annotations,
    Segment,
    VolsegEntryResponse,
    Volume,
)
from app.core.settings.api_settings import get_api_settings
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
        snapshot_file: UploadFile,
    ) -> VolsegEntryResponse:
        entry_id = uuid4()

        base_path = self._get_base_file_path(
            user_id=user.id,
            entry_id=entry_id,
        )
        cvsx_filepath = f"{base_path}/data.cvsx"
        cvsx_bytes = cvsx_file.file.read()
        await self.storage.save(
            file_path=cvsx_filepath,
            file_data=BytesIO(cvsx_bytes),
        )

        snapshot_filepath = f"{base_path}/snapshot.json"
        snapshot_dict = self.binaryio_to_dict(snapshot_file.file)
        snapshot_data: dict = self.rewrite_nodes(id=entry_id, snapshot=snapshot_dict)
        await self.storage.save(
            file_path=snapshot_filepath,
            file_data=self.dict_to_bytesio(snapshot_data),
        )

        annotations_filepath = f"{base_path}/annotations.json"
        annotations_file = self.extract_annotations_json(BytesIO(cvsx_bytes))
        await self.storage.save(
            file_path=annotations_filepath,
            file_data=annotations_file,
        )

        volseg_entry = VolsegEntry(
            id=entry_id,
            name=name,
            is_public=is_public,
            cvsx_filepath=cvsx_filepath,
            snapshot_filepath=snapshot_filepath,
            annotation_filepath=annotations_filepath,
            user=user,
        )

        self.session.add(volseg_entry)
        await self.session.commit()

        cvsx_url, snapshot_url, annotation_url = self.get_urls(entry_id)

        return VolsegEntryResponse.model_validate(
            {
                **volseg_entry.__dict__,
                "cvsx_url": cvsx_url,
                "snapshot_url": snapshot_url,
                "annotation_url": annotation_url,
            }
        )

    def get_urls(self, entry_id: UUID):
        settings = get_api_settings()
        cvsx_url = f"{settings.API_SERVER_URL}{settings.API_V1_PREFIX}/volseg/{entry_id}/data"
        snapshot_url = (
            f"{settings.API_SERVER_URL}{settings.API_V1_PREFIX}/volseg/{entry_id}/snapshot"
        )
        annotation_url = (
            f"{settings.API_SERVER_URL}{settings.API_V1_PREFIX}/volseg/{entry_id}/annotation"
        )
        return cvsx_url, snapshot_url, annotation_url

    def binaryio_to_dict(self, binary_io):
        binary_io.seek(0)
        raw_bytes = binary_io.read()
        decoded_str = raw_bytes.decode("utf-8")
        return json.loads(decoded_str)

    def rewrite_nodes(self, id: UUID, snapshot: dict) -> None:
        settings = get_api_settings()
        snapshot["data"]["tree"]["transforms"][1]["transformer"] = "ms-plugin.download"
        snapshot["data"]["tree"]["transforms"][1]["params"] = {
            "url": f"{settings.API_SERVER_URL}{settings.API_V1_PREFIX}/volseg/{id}/data",
            "label": "CVSX Data",
            "isBinary": True,
        }
        return snapshot

    def dict_to_bytesio(self, data: dict) -> BytesIO:
        json_str = json.dumps(data)
        json_bytes = json_str.encode("utf-8")
        return BytesIO(json_bytes)

    def extract_annotations_json(self, zip_file: BinaryIO) -> dict:
        try:
            with ZipFile(zip_file) as zip_ref:
                file_list = zip_ref.namelist()
                json_file = next((f for f in file_list if f.endswith("annotations.json")), None)

                if json_file is None:
                    raise FileNotFoundError("annotations.json not found in the ZIP archive.")

                with zip_ref.open(json_file) as file:
                    return BytesIO(file.read())

        except BadZipFile:
            print("Error: The provided file is not a valid ZIP archive.")
        except FileNotFoundError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    async def get_entry_by_id(
        self,
        user: User | None,
        volseg_entry_id: UUID,
    ) -> VolsegEntryResponse:
        volseg_entry: VolsegEntry = await self._get_volseg_entry_by_id(volseg_entry_id)

        # await self._check_permissions(volseg_entry, user)

        cvsx_url, snapshot_url, annotation_url = self.get_urls(volseg_entry.id)

        annotations = await self.get_annotations(volseg_entry)

        return VolsegEntryResponse.model_validate(
            {
                **volseg_entry.__dict__,
                "cvsx_url": cvsx_url,
                "snapshot_url": snapshot_url,
                "annotation_url": annotation_url,
                "annotations": annotations,
            }
        )

    async def get_annotations(self, entry: VolsegEntry):
        annotations = await self.storage.get(
            file_path=entry.annotation_filepath,
        )
        decoded = annotations.decode("utf-8")
        annotations_json = json.loads(decoded)

        segments = []
        for segment in annotations_json["descriptions"].values():
            print(
                {
                    "name": segment["name"],
                    "segmentation_id": segment["target_id"]["segmentation_id"],
                    "segment_id": segment["target_id"]["segment_id"],
                    "kind": segment["target_kind"],
                    "time": segment["time"],
                }
            )
            segments.append(
                Segment.model_validate(
                    {
                        "name": segment["name"],
                        "segmentation_id": segment["target_id"]["segmentation_id"],
                        "segment_id": segment["target_id"]["segment_id"],
                        "kind": segment["target_kind"],
                        "time": segment["time"],
                    }
                )
            )
        return Annotations.model_validate(
            {
                "segments": segments,
                "volumes": [Volume()],
            }
        )

    async def list_public_entries(self) -> list[VolsegEntryResponse]:
        result = await self.session.execute(
            select(VolsegEntry).where(VolsegEntry.is_public == True),
        )
        entries: list[VolsegEntry] = result.scalars().all()
        response = []
        for entry in entries:
            cvsx_url, snapshot_url, annotation_url = self.get_urls(entry.id)
            response += [
                VolsegEntryResponse.model_validate(
                    {
                        **entry.__dict__,
                        "cvsx_url": cvsx_url,
                        "snapshot_url": snapshot_url,
                        "annotation_url": annotation_url,
                    }
                )
            ]
        return response

    async def list_user_entries(self, user: User) -> list[VolsegEntryResponse]:
        result = await self.session.execute(
            select(VolsegEntry).where(VolsegEntry.user_id == user.id),
        )
        entries: list[VolsegEntry] = result.scalars().all()
        response = []
        for entry in entries:
            cvsx_url, snapshot_url, annotation_url = self.get_urls(entry.id)
            response += [
                VolsegEntryResponse.model_validate(
                    {
                        **entry.__dict__,
                        "cvsx_url": cvsx_url,
                        "snapshot_url": snapshot_url,
                        "annotation_url": annotation_url,
                    }
                )
            ]
        return response

    async def get_file(
        self,
        *,
        id: UUID,
        user: User,
        file: Literal["cvsx", "snapshot", "annotations"],
    ) -> UUID:
        volseg_entry: VolsegEntry = await self._get_volseg_entry_by_id(id)

        # await self._check_permissions(volseg_entry, user)

        if not volseg_entry.cvsx_filepath:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Missing file for volseg entry",
            )

        try:
            if file == "cvsx":
                file_content = await self.storage.get(
                    file_path=volseg_entry.cvsx_filepath,
                )
                filename = "data.cvsx"
                media_type = None
            elif file == "snapshot":
                file_content = await self.storage.get(
                    file_path=volseg_entry.snapshot_filepath,
                )
                filename = f"snapshot.molj"
                media_type = "application/json"
            else:  # annotations
                file_content = await self.storage.get(
                    file_path=volseg_entry.annotation_filepath,
                )
                filename = "annotations.json"
                media_type = "application/json"

            return Response(
                content=file_content,
                media_type=media_type,
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
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

    async def delete(
        self,
        user: User,
        id: UUID,
    ) -> UUID:
        volseg_entry: VolsegEntry = await self._get_volseg_entry_by_id(id)

        # await self._check_permissions(volseg_entry, user)

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
