import hashlib
import secrets
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.contracts.requests import CreateApiKeyRequest
from app.database.models.api_key_model import ApiKey
from app.database.models.mixins.timestamp_mixin import utcnow
from app.database.models.user_model import User
from app.database.session_manager import get_async_session
from app.repositories.api_key_repository import ApiKeyRepository
from app.repositories.user_repository import UserRepository


class ApiKeyService:
    PREFIX = "cv_"

    def __init__(self, session: AsyncSession):
        self.session = session
        self.api_key_repo = ApiKeyRepository(session)
        self.user_repo = UserRepository(session)

    def _hash_key(self, key: str) -> str:
        return hashlib.sha256(key.encode()).hexdigest()

    async def create_api_key(self, user: User, request: CreateApiKeyRequest) -> tuple[ApiKey, str]:
        raw_key_part = secrets.token_urlsafe(32)
        raw_key = f"{self.PREFIX}{raw_key_part}"

        hashed_key = self._hash_key(raw_key)

        api_key = ApiKey(
            name=request.name,
            key_hash=hashed_key,
            prefix=raw_key[:10],
            owner_id=user.id,
            expires_at=request.expires_at,
        )

        self.api_key_repo.add(api_key)
        await self.api_key_repo.commit()
        await self.api_key_repo.refresh(api_key)

        return api_key, raw_key

    async def get_user_by_key(self, raw_key: str) -> User | None:
        if not raw_key.startswith(self.PREFIX):
            return None

        hashed_key = self._hash_key(raw_key)

        api_key_record = await self.api_key_repo.get_by_hash_join_owner(hashed_key)

        if not api_key_record:
            return None

        if api_key_record.expires_at and api_key_record.expires_at < utcnow():
            return None

        api_key_record.last_used_at = utcnow()

        user = api_key_record.owner

        await self.api_key_repo.commit()

        return user

    async def list_keys(self, user: User) -> list[ApiKey]:
        keys = await self.api_key_repo.list_by_owner(user.id)
        return list(keys)

    async def revoke_key(self, user: User, key_id: UUID) -> None:
        key = await self.api_key_repo.get_by_id_and_owner(key_id, user.id)

        if key:
            await self.api_key_repo.delete(key)
            await self.api_key_repo.commit()


async def get_api_key_service(
    session: AsyncSession = Depends(get_async_session),
) -> ApiKeyService:
    return ApiKeyService(session)
