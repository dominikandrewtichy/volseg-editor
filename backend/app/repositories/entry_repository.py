from typing import Sequence
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.database.models.entry_model import Entry
from app.repositories.base_repository import BaseRepository


class EntryRepository(BaseRepository[Entry]):
    def __init__(self, session):
        super().__init__(session, Entry)

    async def get_with_links(self, entry_id: UUID) -> Entry | None:
        result = await self.session.execute(
            select(Entry).where(Entry.id == entry_id).options(selectinload(Entry.link))  # type: ignore
        )
        return result.scalar_one_or_none()

    async def count_by_owner(self, owner_id: UUID) -> int:
        result = await self.session.execute(select(func.count()).where(Entry.owner_id == owner_id))
        return result.scalar_one()

    async def list_by_owner(
        self,
        owner_id: UUID,
        offset: int,
        limit: int,
        sort_attr: str = "created_at",
        descending: bool = True,
    ) -> Sequence[Entry]:
        order_col = getattr(Entry, sort_attr)
        order_clause = order_col.desc() if descending else order_col.asc()

        result = await self.session.execute(
            select(Entry)
            .where(Entry.owner_id == owner_id)
            .options(selectinload(Entry.link))  # type: ignore
            .order_by(order_clause)
            .offset(offset)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_storage_usage(self, owner_id: UUID) -> int:
        result = await self.session.execute(
            select(func.sum(Entry.size_bytes)).where(Entry.owner_id == owner_id)
        )
        usage = result.scalar_one()
        return usage if usage is not None else 0
