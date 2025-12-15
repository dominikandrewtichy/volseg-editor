from typing import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.core.settings.api_settings import get_api_settings
from app.database.session_manager import get_session_manager
from app.services.api_key_service import ApiKeyService
from app.services.auth_service import AuthService
from app.services.user_service import UserService

RequestResponseEndpoint = Callable[[Request], Awaitable[Response]]


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        auth_service: AuthService,
    ):
        super().__init__(app)
        self.auth_service: AuthService = auth_service

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request.state.user = None

        token = request.cookies.get(get_api_settings().JWT_ACCESS_TOKEN_COOKIE)

        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return await call_next(request)

        if token.startswith(ApiKeyService.PREFIX):
            await self._authenticate_via_api_key(request, token)
        else:
            await self._authenticate_via_jwt(request, token)

        return await call_next(request)

    async def _authenticate_via_api_key(self, request: Request, token: str):
        async with get_session_manager().session() as session:
            api_key_service = ApiKeyService(session)
            user = await api_key_service.get_user_by_key(token)
            if user:
                request.state.user = user

    async def _authenticate_via_jwt(self, request: Request, token: str):
        payload = self.auth_service.verify_token(token)
        if not payload:
            return

        user_id = payload.get("sub")
        if not user_id:
            return

        async with get_session_manager().session() as session:
            user_service = UserService(session)
            user = await user_service.get_user_by_id(user_id)
            request.state.user = user
