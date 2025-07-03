from typing import Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.security import get_admin_user_token, get_regular_user_token
from app.database.models.role_model import RoleEnum


class TestAuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        role: RoleEnum = None,
        enabled: bool = False,
    ):
        super().__init__(app)
        self.role = role
        self.enabled = enabled

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if self.enabled:
            if self.role == RoleEnum.user:
                token = get_regular_user_token()
            else:
                token = get_admin_user_token()

            request.headers.__dict__["_list"].append(
                (
                    "authorization".encode(),
                    f"Bearer {token}".encode(),
                )
            )

        response = await call_next(request)
        return response
