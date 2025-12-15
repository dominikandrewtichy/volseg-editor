from typing import Sequence
from uuid import UUID

from sqlalchemy import select

from app.database.models.api_key_model import ApiKey
from app.database.models.user_model import User
from app.repositories.base_repository import BaseRepository


class ApiKeyRepository(BaseRepository[ApiKey]):
    def __init__(self, session):
        super().__init__(session, ApiKey)

    async def get_by_hash_join_owner(self, hashed_key: str) -> ApiKey | None:
        query = select(ApiKey).join(User).where(ApiKey.key_hash == hashed_key)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_by_owner(self, owner_id: UUID) -> Sequence[ApiKey]:
        query = select(ApiKey).where(ApiKey.owner_id == owner_id).order_by(ApiKey.created_at.desc())
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_by_id_and_owner(self, key_id: UUID, owner_id: UUID) -> ApiKey | None:
        query = select(ApiKey).where(ApiKey.id == key_id, ApiKey.owner_id == owner_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
