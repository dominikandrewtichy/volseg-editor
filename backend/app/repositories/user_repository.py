from sqlalchemy import select

from app.database.models.user_model import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session):
        super().__init__(session, User)

    async def get_by_sub(self, sub: str) -> User | None:
        result = await self.session.execute(select(User).where(User.sub == sub))
        return result.scalar_one_or_none()
