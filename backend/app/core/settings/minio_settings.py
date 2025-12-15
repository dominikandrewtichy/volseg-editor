import os
from functools import lru_cache

from app.core.settings.base_settings import BaseAppSettings


class MinioSettings(BaseAppSettings):
    MINIO_ENDPOINT: str = os.environ.get("MINIO_ENDPOINT", "")
    MINIO_ROOT_USER: str = os.environ.get("MINIO_ROOT_USER", "")
    MINIO_ROOT_PASSWORD: str = os.environ.get("MINIO_ROOT_PASSWORD", "")
    MINIO_SECURE: bool = False
    MINIO_BUCKET: str = "volseg-editor"


@lru_cache()
def get_minio_settings():
    return MinioSettings()
