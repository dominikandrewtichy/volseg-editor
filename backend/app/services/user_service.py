from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.role_model import Role, RoleEnum
from app.database.models.user_model import User
from app.database.session_manager import get_async_session


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(
        self,
        *,
        openid: str,
        name: str,
        email: str,
    ) -> User:
        result = await self.session.execute(
            select(Role).where(Role.name == RoleEnum.user),
        )
        user_role: Role | None = result.scalar()
        if not user_role:
            return HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing user role entity",
            )

        new_user: User = User(
            openid=openid,
            name=name,
            email=email,
            role=user_role,
        )

        self.session.add(new_user)
        await self.session.commit()

        return new_user

    async def get_user_by_id(self, id: UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.id == id),
        )
        user: User | None = result.scalar()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def get_user_by_openid(self, openid: UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.openid == openid),
        )
        user: User | None = result.scalar()
        return user

    # TODO: add soft delete
    async def delete_user(self) -> User:
        pass  # TODO


async def get_user_service(
    session: AsyncSession = Depends(get_async_session),
) -> UserService:
    return UserService(session)
