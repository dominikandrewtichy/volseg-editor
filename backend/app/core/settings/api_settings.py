import os
from functools import lru_cache

from app.core.settings.base_settings import BaseAppSettings


class ApiSettings(BaseAppSettings):
    # API
    API_V1_PREFIX: str = "/api/v1"
    API_OPENAPI_URL: str = f"/api/v1/openapi.json"

    # APP
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

    # SERVER URLS
    API_SERVER_URL: str = os.getenv("API_SERVER_URL")
    WEB_SERVER_URL: str = os.getenv("WEB_SERVER_URL")

    # CORS
    CORS_ORIGINS: list[str] = [
        API_SERVER_URL,  # for OpenAPI docs
        WEB_SERVER_URL,  # for frontend
    ]

    # COOKIES
    COOKIE_SESSION_SECRET: str = os.getenv("COOKIE_SESSION_SECRET")

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_COOKIE: str = "access_token"
    JWT_REFRESH_TOKEN_COOKIE: str = "refresh_token"

    # OIDC
    OIDC_CLIENT_ID: str = os.getenv("OIDC_CLIENT_ID")
    OIDC_CLIENT_SECRET: str = os.getenv("OIDC_CLIENT_SECRET")
    OIDC_ISSUER_URL: str = os.getenv("OIDC_ISSUER_URL")
    OIDC_REDIRECT_URI: str = os.getenv("OIDC_REDIRECT_URI")
    OIDC_SCOPES: list[str] = ["openid", "profile", "email", "offline_access"]
    OIDC_AUTHORIZATION_URL: str = f"{OIDC_ISSUER_URL}/authorize"
    OIDC_TOKEN_URL: str = f"{OIDC_ISSUER_URL}/token"
    OIDC_USERINFO_URL: str = f"{OIDC_ISSUER_URL}/userinfo"


@lru_cache()
def get_api_settings():
    return ApiSettings()
