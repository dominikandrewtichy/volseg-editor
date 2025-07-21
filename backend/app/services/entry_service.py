from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.contracts.requests.entry_requests import (
    EntryCreateRequest,
    EntryUpdateRequest,
    SearchQueryParams,
)
from app.api.v1.contracts.responses.entry_responses import EntryResponse
from app.api.v1.contracts.responses.pagination_response import PaginatedResponse
from app.api.v1.contracts.responses.share_link_responses import ShareLinkResponse
from app.api.v1.contracts.responses.view_responses import ViewResponse
from app.database.models.entry_model import Entry
from app.database.models.share_link_model import ShareLink
from app.database.models.user_model import User
from app.database.models.view_model import View
from app.database.models.volseg_entry_model import VolsegEntry
from app.database.session_manager import get_async_session
from app.services.share_link_service import ShareLinkService, get_share_link_service


class EntryService:
    def __init__(self, session: AsyncSession, share_link_service: ShareLinkService):
        self.session = session
        self.share_link_service = share_link_service

    async def create(
        self,
        *,
        user: User,
        request: EntryCreateRequest,
    ) -> Entry:
        volseg_entry: VolsegEntry | None = await self.session.get(
            VolsegEntry,
            request.volseg_entry_id,
        )
        if volseg_entry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Volseg entry not found",
            )

        new_link = ShareLink()
        new_entry = Entry(
            user=user,
            link=new_link,
            views=[],
            volseg_entry=volseg_entry,
            **request.model_dump(),
        )

        self.session.add(new_entry)
        await self.session.commit()

        return new_entry

    async def get_entry(
        self,
        *,
        user: User,
        entry_id: UUID,
    ) -> EntryResponse:
        entry: Entry = await self._get_entry_by_id(entry_id)

        # Load in relationships
        await self.session.refresh(entry, ["views", "link"])

        # Check permissions
        self._check_permissions(
            entry=entry,
            user=user,
        )

        return EntryResponse.model_validate(entry)

    async def get_entry_share_link(
        self,
        *,
        user: User,
        entry_id: UUID,
    ) -> ShareLinkResponse:
        entry: Entry = await self._get_entry_by_id(entry_id)

        # Load in relationships
        await self.session.refresh(entry, ["link"])

        # Check permissions
        self._check_permissions(
            entry=entry,
            user=user,
        )

        return ShareLinkResponse.model_validate(entry.link)

    async def get_entry_thumbnail_view(
        self,
        *,
        entry_id: UUID,
        user: User,
    ) -> ViewResponse:
        entry: Entry = await self._get_entry_by_id(entry_id)

        # Check permissions
        self._check_permissions(
            entry=entry,
            user=user,
        )

        result = await self.session.execute(
            select(View)
            .where(View.entry_id == entry_id, View.is_thumbnail == True)
            .options(selectinload(View.entry)),
        )
        views: list[View] = result.scalars().all()

        if not views:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="Entry does not have a thumbnail view",
            )

        return ViewResponse.model_validate(views[0])

    async def get_entry_by_share_link(
        self,
        *,
        share_link_id: UUID,
    ):
        share_link: ShareLink | None = await self.session.get(ShareLink, share_link_id)

        if share_link is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Share link not found",
            )

        if not share_link.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Link is not active",
            )

        # Get the shared entry
        entry: Entry = await self._get_entry_by_id(share_link.entry_id)

        return EntryResponse.model_validate(entry)

    async def list_public_entries(
        self,
        *,
        search_query: SearchQueryParams,
    ):
        query = select(Entry).where(Entry.is_public == True)

        if search_query.search_term:
            search_term = f"%{search_query.search_term}%"
            query = query.filter(
                or_(Entry.name.ilike(search_term), Entry.description.ilike(search_term))
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_items = await self.session.scalar(count_query)
        query = query.order_by(Entry.created_at.desc())
        query = query.offset((search_query.page - 1) * search_query.per_page).limit(
            search_query.per_page
        )
        result = await self.session.execute(query)
        entries = result.scalars().all()
        total_pages = (total_items + search_query.per_page - 1) // search_query.per_page

        return PaginatedResponse(
            items=entries,
            total_items=total_items,
            page=search_query.page,
            per_page=search_query.per_page,
            total_pages=total_pages,
        )

    async def list_user_entries(self, user_id: int, search_query: SearchQueryParams):
        query = select(Entry).where(Entry.user_id == user_id)

        if search_query.search_term:
            search_conditions = []
            for term in search_query.search_term:
                search_term = f"%{term}%"
                search_conditions.append(
                    or_(Entry.name.ilike(search_term), Entry.description.ilike(search_term))
                )
            if search_conditions:
                query = query.filter(*search_conditions)

        count_query = select(func.count()).select_from(query.subquery())
        total_items = await self.session.scalar(count_query)
        query = query.order_by(Entry.created_at.desc())
        query = query.offset((search_query.page - 1) * search_query.per_page).limit(
            search_query.per_page
        )
        query = query.options(selectinload(Entry.views), selectinload(Entry.link))
        result = await self.session.execute(query)
        entries = result.scalars().all()
        total_pages = (total_items + search_query.per_page - 1) // search_query.per_page

        return PaginatedResponse(
            items=entries,
            total_items=total_items,
            page=search_query.page,
            per_page=search_query.per_page,
            total_pages=total_pages,
        )

    async def update(
        self,
        *,
        entry_id: UUID,
        user: User,
        request: EntryUpdateRequest,
    ) -> Entry:
        entry: Entry = await self._get_entry_by_id(entry_id)

        # Check permissions
        self._check_permissions(
            entry=entry,
            user=user,
        )

        # Update model
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(entry, key, value)
        await self.session.commit()

        return EntryResponse.model_validate(entry)

    # TODO: add soft delete
    async def delete(
        self,
        *,
        entry_id: UUID,
        user: User,
    ) -> UUID:
        entry: Entry = await self._get_entry_by_id(entry_id)

        # Check permissions
        self._check_permissions(
            entry=entry,
            user=user,
        )

        await self.session.delete(entry)
        await self.session.commit()

        return entry.id

    async def _get_entry_by_id(self, id: UUID) -> Entry:
        entry: Entry | None = await self.session.get(Entry, id)
        if entry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entry not found",
            )
        return entry

    async def _check_permissions(
        self,
        *,
        entry: Entry,
        user: User | None,
    ) -> bool:
        if not entry.is_public and not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Entry is not public",
            )
        if entry.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Don't have access to entry",
            )


async def get_entry_service(
    session: AsyncSession = Depends(get_async_session),
    share_link_service: AsyncSession = Depends(get_share_link_service),
) -> EntryService:
    return EntryService(
        session=session,
        share_link_service=share_link_service,
    )
