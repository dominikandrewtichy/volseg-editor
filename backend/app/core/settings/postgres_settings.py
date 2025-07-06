import os
from functools import lru_cache

from app.core.settings.base_settings import BaseAppSettings


class PostgresSettings(BaseAppSettings):
    POSTGRES_DIALECT: str = "postgresql"
    POSTGRES_DBAPI: str = "asyncpg"
    POSTGRES_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    POSTGRES_URL: str = f"{POSTGRES_DIALECT}+{POSTGRES_DBAPI}://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"


@lru_cache()
def get_postgres_settings():
    return PostgresSettings()
