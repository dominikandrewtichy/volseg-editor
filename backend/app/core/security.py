from datetime import timedelta
from functools import lru_cache
from typing import Any, Literal
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jwt import ExpiredSignatureError, decode, encode
from pydantic import BaseModel

from app.core.settings import get_settings
from app.database.models.mixins.timestamp_mixin import utcnow
from app.database.models.role_model import RoleEnum
from app.database.models.user_model import User
from app.database.session_manager import get_session_manager


@lru_cache
def get_admin_user_id():
    return "11111111-1111-1111-1111-111111111111"


@lru_cache
def get_regular_user_id():
    return "22222222-2222-2222-2222-222222222222"


class Token(BaseModel):
    token: str
    token_type: Literal["access", "refresh"]


class TokenData(BaseModel):
    sub: UUID
    scopes: list[str] = []


oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{get_settings().API_V1_PREFIX}/token",
    tokenUrl=f"{get_settings().API_V1_PREFIX}/token",
    auto_error=False,
    scopes={"openid": "OpenId", "email": "Email"},
)


def create_access_token(data: dict[str, str], expires_delta: timedelta = None) -> str:
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


async def refresh_access_token(refresh_token: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            get_settings().OIDC_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": get_settings().OIDC_CLIENT_ID,
                "client_secret": get_settings().OIDC_CLIENT_SECRET,
            },
        )
        token_data = response.json()

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token",
        )

    token_data = response.json()

    if "access_token" not in token_data:
        return None

    return token_data


def decode_token(token: str) -> dict[str, Any]:
    return decode(
        jwt=token,
        key=get_settings().JWT_SECRET_KEY,
        algorithms=[get_settings().JWT_ALGORITHM],
    )


def get_regular_user_token():
    return create_access_token({"sub": get_regular_user_id()}, expires_delta=timedelta(hours=10))


def get_admin_user_token():
    return create_access_token({"sub": get_admin_user_id()}, expires_delta=timedelta(hours=10))


def get_token_from_request(request: Request) -> str | None:
    return request.cookies.get(get_settings().JWT_ACCESS_TOKEN_COOKIE)


def delete_jwt_tokens(response: Response) -> None:
    response.delete_cookie(
        key=get_settings().JWT_ACCESS_TOKEN_COOKIE,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.delete_cookie(
        key=get_settings().JWT_REFRESH_TOKEN_COOKIE,
        httponly=True,
        secure=False,
        samesite="lax",
    )


def get_required_user(
    required_role: RoleEnum | None = None,
) -> User:
    async def _get_current_user(
        user_id: str | None = Depends(get_current_user_id(required_role)),
    ) -> User:
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        async with get_session_manager().session() as session:
            user: User | None = await session.get(User, user_id)
            await session.refresh(user, ["role"])
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found",
                )
            return user

    return _get_current_user


def get_optional_user(required_role: RoleEnum | None = None) -> User | None:
    async def _get_optional_user(
        user_id: str | None = Depends(get_current_user_id(required_role)),
    ) -> User:
        if not user_id:
            return None
        async with get_session_manager().session() as session:
            user: User | None = await session.get(User, user_id)
            await session.refresh(user, ["role"])
            return user

    return _get_optional_user


def get_current_user_id(required_role: RoleEnum | None = None) -> str | None:
    async def _get_user(request: Request, response: Response):
        token = get_token_from_request(request)

        if token is None:
            return None
        try:
            payload = decode_token(token)
            user_id = payload["sub"]
            return user_id
        except ExpiredSignatureError:
            delete_jwt_tokens(response)
        except:
            return None

    return _get_user


def check_user_roles(allowed_roles: list[RoleEnum]):
    async def check_user(current_user: User = Depends(get_current_user_id)):
        if not any(role.name != current_user.role.name for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return check_user
