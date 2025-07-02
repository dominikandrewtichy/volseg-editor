from typing import Callable

from fastapi import Request, Response
from jwt import ExpiredSignatureError, decode
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.security import refresh_access_token
from app.core.settings import get_settings


class RefreshTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")

        response = Response(
            "Unauthorized",
            status_code=401,
        )

        if not access_token or not refresh_token:
            return await call_next(request)

        try:
            # Verify access token, decode payload
            payload = decode(
                jwt=access_token,
                key=get_settings().JWT_SECRET_KEY,
                algorithms=["HS256"],
            )
            # You can attach user info to request.state here
            request.state.user_id = payload.get("sub")

            response = await call_next(request)
            return response

        except ExpiredSignatureError:
            new_tokens = await refresh_access_token(refresh_token)
            if not new_tokens:
                return response

            # Set new tokens in response cookies
            response = await call_next(request)  # continue request
            response.set_cookie(
                key=get_settings().JWT_ACCESS_TOKEN_COOKIE,
                value=new_tokens["access_token"],
                httponly=True,
                secure=False,
                samesite="Lax",
            )
            if "refresh_token" in new_tokens:
                response.set_cookie(
                    key=get_settings().JWT_REFRESH_TOKEN_COOKIE,
                    value=new_tokens["refresh_token"],
                    httponly=True,
                    secure=False,
                    samesite="Lax",
                )

            # You might want to decode new access token to attach user info
            payload = decode(
                new_tokens["access_token"],
                get_settings().JWT_SECRET_KEY,
                algorithms=["HS256"],
            )
            request.state.user_id = payload.get("sub")

            return response
