import os
from enum import Enum
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class ModeEnum(str, Enum):
    development = "development"
    production = "production"
    testing = "testing"


class Settings(BaseSettings):
    MODE: ModeEnum = ModeEnum.development

    # API
    API_V1_PREFIX: str = "/api/v1"

    # APP INFO
    APP_NAME: str = "CELLIM Viewer API"
    APP_SUMMARY: str = "API managing CELLIM data entries"
    APP_VERSION: str = "0.0.0"
    APP_HOST: str = "localhost"
    APP_PORT: str = "8000"
    APP_URL: str = f"http://{APP_HOST}:{APP_PORT}"
    APP_CONTACT: dict[str, str] = {
        "name": "CELLIM Viewer developers",
        "url": "https://github.com/MergunFrimen/cellim-viewer",
        "email": "492772@mail.muni.cz",
    }
    APP_LICENCE: dict[str, str] = {
        "name": "Apache 2.0",
        "identifier": "MIT",
    }
    OPENAPI_URL: str = f"{API_V1_PREFIX}/openapi.json"

    # CORS
    CORS_ORIGINS: list[str] = [
        APP_URL,  # for OpenAPI docs
        "http://localhost:5173",  # for frontend
        "http://78.128.235.41:6080",  # prod frontend
        "http://localhost:6006",  # for storybook
    ]

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    ACCESS_TOKEN_COOKIE: str = "access_token"

    # MINIO
    MINIO_HOST: str = os.getenv("MINIO_HOST")
    MINIO_PORT: str = os.getenv("MINIO_PORT")
    MINIO_ENDPOINT: str = f"{MINIO_HOST}:{MINIO_PORT}"
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE")

    # POSTGRES
    POSTGRES_DIALECT: str = "postgresql"
    POSTGRES_DBAPI: str = "asyncpg"
    POSTGRES_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    POSTGRES_URL: str = f"{POSTGRES_DIALECT}+{POSTGRES_DBAPI}://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

    # LOCAL STORAGE
    FILES_BASH_PATH: str = "./temp"
    FILES_PATH_VOLSEG_ENTRIES: str = f"{FILES_BASH_PATH}/volseg_entries"

    model_config = SettingsConfigDict(
        env_file=".env.example",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings():
    return Settings()
