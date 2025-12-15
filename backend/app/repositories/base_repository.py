from typing import Generic, Type, TypeVar
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.base_model import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model: Type[ModelType]):
        self.session = session
        self.model = model

    async def get_by_id(self, id: UUID) -> ModelType | None:
        return await self.session.get(self.model, id)

    def add(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        await self.session.delete(obj)

    async def commit(self) -> None:
        await self.session.commit()

    async def refresh(self, obj: ModelType, attribute_names: list[str] | None = None) -> None:
        await self.session.refresh(obj, attribute_names=attribute_names)
