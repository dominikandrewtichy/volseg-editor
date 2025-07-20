import os
from functools import lru_cache

from app.core.settings.base_settings import BaseAppSettings


class MinioSettings(BaseAppSettings):
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "")
    MINIO_ROOT_USER: str = os.getenv("MINIO_ROOT_USER", "")
    MINIO_ROOT_PASSWORD: str = os.getenv("MINIO_ROOT_PASSWORD", "")
    MINIO_SECURE: bool = False
    MINIO_BUCKET: str = "cellim-viewer"


@lru_cache()
def get_minio_settings():
    return MinioSettings()
