from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.entry_model import Entry
from app.database.models.share_link_model import ShareLink
from app.database.models.user_model import User
from app.database.session_manager import get_async_session
from app.repositories.share_link_repository import ShareLinkRepository


class ShareLinkService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.share_link_repo = ShareLinkRepository(session)

    async def get_entry_from_share_link(
        self,
        *,
        share_link_id: UUID,
    ) -> Entry:
        share_link = await self.share_link_repo.get_with_entry(share_link_id)

        if not share_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Link not found",
            )
        if not share_link.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Link is not active",
            )
        await self.share_link_repo.refresh(share_link.entry, ["link"])

        return share_link.entry

    async def update(
        self,
        *,
        share_link_id: UUID,
        user: User,
        is_active: bool,
    ) -> ShareLink:
        share_link = await self.share_link_repo.get_with_entry(share_link_id)

        if not share_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Share link not found",
            )

        if share_link.entry.owner_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        share_link.is_active = is_active

        await self.share_link_repo.commit()
        await self.share_link_repo.refresh(share_link)

        return share_link


async def get_share_link_service(
    session: AsyncSession = Depends(get_async_session),
) -> ShareLinkService:
    return ShareLinkService(session)
