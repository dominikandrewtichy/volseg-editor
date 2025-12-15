from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.models.share_link_model import ShareLink
from app.repositories.base_repository import BaseRepository


class ShareLinkRepository(BaseRepository[ShareLink]):
    def __init__(self, session):
        super().__init__(session, ShareLink)

    async def get_by_entry_id(self, entry_id: UUID) -> ShareLink | None:
        result = await self.session.execute(select(ShareLink).where(ShareLink.entry_id == entry_id))
        return result.scalar_one_or_none()

    async def get_with_entry(self, share_link_id: UUID) -> ShareLink | None:
        result = await self.session.execute(
            select(ShareLink)
            .where(ShareLink.id == share_link_id)
            .options(selectinload(ShareLink.entry))
        )
        return result.scalar_one_or_none()
