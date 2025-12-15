import os
from functools import lru_cache

from app.core.settings.base_settings import BaseAppSettings


class ApiSettings(BaseAppSettings):
    # API
    API_V1_PREFIX: str = "/api/v1"
    API_OPENAPI_URL: str = f"/api/v1/openapi.json"

    # APP
    APP_NAME: str = "VolSeg Editor API"
    APP_SUMMARY: str = "API managing VolSeg data entries"
    APP_VERSION: str = "1.0.0"
    APP_CONTACT: dict[str, str] = {
        "name": "VolSeg Editor developers",
        "url": "https://github.com/dominikandrewtichy/volseg-editor",
        "email": "492772@mail.muni.cz",
    }
    APP_LICENCE: dict[str, str] = {
        "name": "Apache 2.0",
        "identifier": "Apache-2.0",
    }

    # SERVER URLS
    API_SERVER_URL: str = os.environ.get("API_SERVER_URL", "")
    WEB_SERVER_URL: str = os.environ.get("WEB_SERVER_URL", "")
    MVSTORY_URL: str = "https://molstar.org"

    # CORS
    CORS_ALLOW_ORIGINS: list[str] = [
        API_SERVER_URL,  # for OpenAPI docs
        WEB_SERVER_URL,  # for frontend
        MVSTORY_URL,
    ]
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True

    # COOKIES
    COOKIE_SESSION_SECRET: str = os.environ.get("COOKIE_SESSION_SECRET", "")

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 24 * 60
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_COOKIE: str = "access_token"
    JWT_REFRESH_TOKEN_COOKIE: str = "refresh_token"

    # OIDC
    OIDC_CLIENT_ID: str = os.environ.get("OIDC_CLIENT_ID", "")
    OIDC_CLIENT_SECRET: str = os.environ.get("OIDC_CLIENT_SECRET", "")
    OIDC_ISSUER_URL: str = os.environ.get("OIDC_ISSUER_URL", "")
    OIDC_REDIRECT_URI: str = os.environ.get("OIDC_REDIRECT_URI", "")
    OIDC_SCOPES: list[str] = ["openid", "profile", "email", "offline_access"]
    OIDC_AUTHORIZATION_URL: str = f"{OIDC_ISSUER_URL}/authorize"
    OIDC_TOKEN_URL: str = f"{OIDC_ISSUER_URL}/token"
    OIDC_USERINFO_URL: str = f"{OIDC_ISSUER_URL}/userinfo"

    # STORAGE
    STORAGE_QUOTA: int = 20 * 1024 * 1024 * 1024
    STORAGE_MAX_UPLOAD_SIZE: int = 2 * 1024 * 1024 * 1024


@lru_cache()
def get_api_settings():
    return ApiSettings()
