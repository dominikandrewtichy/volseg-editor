import os
from enum import Enum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # SERVER URLS
    API_SERVER_URL: str = os.getenv("API_SERVER_URL")
    WEB_SERVER_URL: str = os.getenv("WEB_SERVER_URL")

    # CORS
    CORS_ORIGINS: list[str] = [
        API_SERVER_URL,  # for OpenAPI docs
        WEB_SERVER_URL,  # for frontend
    ]

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_COOKIE: str = "access_token"
    JWT_REFRESH_TOKEN_COOKIE: str = "refresh_token"

    # MINIO
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY")
    MINIO_SECURE: bool = False
    MINIO_BUCKET: str = "cellim-viewer"

    # OIDC
    OIDC_CLIENT_ID: str = os.getenv("OIDC_CLIENT_ID")
    OIDC_CLIENT_SECRET: str = os.getenv("OIDC_CLIENT_SECRET")
    OIDC_ISSUER_URL: str = os.getenv("OIDC_ISSUER_URL")
    OIDC_REDIRECT_URI: str = os.getenv("OIDC_REDIRECT_URI")
    OIDC_SCOPES: list[str] = ["openid", "profile", "email", "offline_access"]
    OIDC_AUTHORIZATION_URL: str = f"{OIDC_ISSUER_URL}/authorize"
    OIDC_TOKEN_URL: str = f"{OIDC_ISSUER_URL}/token"
    OIDC_USERINFO_URL: str = f"{OIDC_ISSUER_URL}/userinfo"

    # POSTGRES
    POSTGRES_DIALECT: str = "postgresql"
    POSTGRES_DBAPI: str = "asyncpg"
    POSTGRES_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    POSTGRES_URL: str = f"{POSTGRES_DIALECT}+{POSTGRES_DBAPI}://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env.example",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # SESSION
    COOKIE_SESSION_SECRET: str = os.getenv("COOKIE_SESSION_SECRET")


@lru_cache
def get_settings():
    return Settings()
