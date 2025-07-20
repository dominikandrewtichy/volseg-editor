from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, File, UploadFile

from app.api.v1.tags import Tags
from app.core.settings import get_settings
from app.services.files.minio_storage import MinioStorage

router = APIRouter(prefix="/test", tags=[Tags.test])


@router.post("/upload")
async def upload_file(
    file: Annotated[UploadFile, File()],
):
    settings = get_settings()
    storage = MinioStorage(
        endpoint=settings.MINIO_ENDPOINT,
        bucket=settings.MINIO_BUCKET,
        access_key=settings.MINIO_ROOT_USER,
        secret_key=settings.MINIO_ROOT_PASSWORD,
        secure=settings.MINIO_SECURE,
    )

    await storage.save(
        f"somewhere/{uuid4()}",
        file.file,
    )

    return "OK"
