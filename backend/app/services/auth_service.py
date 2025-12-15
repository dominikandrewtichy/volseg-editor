from datetime import timedelta
from typing import Any

from jwt import decode, encode

from app.core.settings import get_settings
from app.core.settings.api_settings import get_api_settings
from app.database.models.mixins.timestamp_mixin import utcnow


class AuthService:
    def __init__(self):
        pass

    def verify_token(self, token: str) -> dict[str, Any] | None:
        try:
            payload: dict[str, Any] = decode(
                jwt=token,
                key=get_api_settings().JWT_SECRET_KEY,
                algorithms=[get_api_settings().JWT_ALGORITHM],
            )
            return payload
        except:
            return None

    def create_access_token(
        self,
        data: dict[str, str],
        expires_delta: timedelta | None = None,
    ) -> str:
        to_encode = data.copy()

        if expires_delta:
            expire = utcnow() + expires_delta
        else:
            expire = utcnow() + timedelta(minutes=get_settings().JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})

        return encode(
            payload=to_encode,
            key=get_settings().JWT_SECRET_KEY,
            algorithm=get_settings().JWT_ALGORITHM,
        )


async def get_auth_service() -> AuthService:
    return AuthService()
