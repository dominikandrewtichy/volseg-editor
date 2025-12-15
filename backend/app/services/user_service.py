from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.user_model import User
from app.database.session_manager import get_async_session
from app.repositories.entry_repository import EntryRepository
from app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.entry_repo = EntryRepository(session)

    async def create_user(
        self,
        *,
        sub: str | None,
        name: str | None,
        email: str | None,
    ) -> User:
        new_user = User(
            sub=sub,
            name=name,
            email=email,
        )

        self.user_repo.add(new_user)
        await self.user_repo.commit()
        await self.user_repo.refresh(new_user)

        return new_user

    async def get_user_by_id(self, id: UUID) -> User | None:
        return await self.user_repo.get_by_id(id)

    async def get_user_by_sub(self, sub: str) -> User | None:
        return await self.user_repo.get_by_sub(sub)

    async def get_storage_usage(self, user_id: UUID) -> int:
        return await self.entry_repo.get_storage_usage(user_id)


async def get_user_service(
    session: AsyncSession = Depends(get_async_session),
) -> UserService:
    return UserService(session)
