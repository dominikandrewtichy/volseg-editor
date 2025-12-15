from functools import lru_cache

from app.core.settings.api_settings import ApiSettings
from app.core.settings.minio_settings import MinioSettings
from app.core.settings.postgres_settings import PostgresSettings


class Settings(
    ApiSettings,
    MinioSettings,
    PostgresSettings,
): ...


@lru_cache()
def get_settings():
    return Settings()
