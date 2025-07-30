import json
from uuid import UUID, uuid4

from fastapi import Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.contracts.requests.view_requests import ViewCreateRequest, ViewUpdateRequest
from app.api.v1.contracts.responses.view_responses import ViewResponse
from app.database.models.entry_model import Entry
from app.database.models.user_model import User
from app.database.models.view_model import View
from app.database.session_manager import get_async_session
from app.services.entry_service import EntryService, get_entry_service
from app.services.files.base_storage import BaseStorage
from app.services.files.minio_storage import get_minio_storage


class ViewService:
    def __init__(
        self,
        session: AsyncSession,
        storage: BaseStorage,
        entry_service: EntryService,
    ):
        self.session = session
        self.storage = storage
        self.entry_service = entry_service

    async def create(
        self,
        user: User,
        entry_id: UUID,
        request: ViewCreateRequest,
    ) -> ViewResponse:
        entry: Entry = await self.entry_service._get_entry_by_id(entry_id)

        # Check permissions
        self._check_permissions(entry, user)

        view_id = uuid4()
        thumbnail_url: str | None = None
        snapshot_url: str | None = None

        # Determine the next order_index
        result = await self.session.execute(
            select(View.order_index)
            .where(View.entry_id == entry_id)
            .order_by(View.order_index.desc())
            .limit(1)
        )
        last_order_index = result.scalar_one_or_none()
        new_order_index = (last_order_index or 0) + 1

        # Save snapshot
        if request.snapshot_json:
            try:
                file_path = f"/entries/{entry_id}/views/{view_id}/snapshot.json"
                snapshot_url = await self.storage.save(
                    file_path=file_path,
                    file_data=request.snapshot_json.file,
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error saving JSON snapshot: {str(e)}",
                )

        # Save image
        if request.thumbnail_image:
            try:
                file_path = f"/entries/{entry_id}/views/{view_id}/thumbnail.png"
                thumbnail_url = await self.storage.save(
                    file_path=file_path,
                    file_data=request.thumbnail_image.file,
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error saving image: {str(e)}",
                )

        # Save view
        new_view = View(
            id=view_id,
            name=request.name,
            description=request.description,
            is_thumbnail=request.is_thumbnail,
            snapshot_url=snapshot_url,
            thumbnail_url=thumbnail_url,
            entry=entry,
            order_index=new_order_index,
        )
        self.session.add(new_view)
        await self.session.commit()

        # Set this view as the entry's default thumbnail
        if request.is_thumbnail:
            await self._set_entry_as_default_thumbnail(new_view)

        return ViewResponse.model_validate(new_view)

    async def get_view(self, user: User, view_id: UUID) -> ViewResponse:
        view: View = await self._get_view_by_id(view_id)

        # Load in relationships
        await self.session.refresh(view, ["entry"])

        # Check permissions
        self._check_permissions(view.entry, user)

        return ViewResponse.model_validate(view)

    async def get_view_snapshot(
        self, user: User | None, entry_id: UUID, view_id: UUID
    ) -> JSONResponse:
        view: View = await self._get_view_by_id(view_id)

        # Load in relationships
        await self.session.refresh(view, ["entry"])

        # Check permissions
        self._check_permissions(view.entry, user)

        if not view.snapshot_url:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="View doesn't have a snapshot",
            )

        try:
            snapshot = await self.storage.get(
                file_path=view.snapshot_url,
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thumbnail not found",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"{e}",
            )

        return json.loads(snapshot)

    async def get_view_thumbnail(
        self,
        *,
        user: User,
        entry_id: UUID,
        view_id: UUID,
    ) -> UUID:
        view: View = await self._get_view_by_id(view_id)

        # Load in relationships
        await self.session.refresh(view, ["entry"])

        # Check permissions
        self._check_permissions(view.entry, user)

        if not view.thumbnail_url:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="View doesn't have a thumbnail",
            )

        try:
            thumbnail_image = await self.storage.get(
                file_path=view.thumbnail_url,
            )
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thumbnail not found",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"{e}",
            )

        return Response(
            content=thumbnail_image,
            media_type="image/png",
        )

    async def list_views_for_entry(self, user: User | None, entry_id: UUID) -> list[ViewResponse]:
        entry: Entry = await self.entry_service._get_entry_by_id(entry_id)

        # Get entry's views, ordered by order_index
        result = await self.session.execute(
            select(View)
            .where(View.entry_id == entry_id)
            .options(selectinload(View.entry))
            .order_by(View.order_index)
        )
        views: list[View] = result.scalars().all()

        # Check permissions
        self._check_permissions(entry, user)

        return [ViewResponse.model_validate(view) for view in views]

    async def update(
        self,
        *,
        entry_id: UUID,
        view_id: UUID,
        user: User,
        updates: ViewUpdateRequest,
    ) -> ViewResponse:
        view: View = await self._get_view_by_id(view_id)

        # Check valid query params
        if view.entry_id != entry_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Entry '{entry_id}' does not have view '{view_id}'",
            )

        # Load in relationships
        await self.session.refresh(view, ["entry"])

        # Check permissions
        self._check_permissions(view.entry, user)

        # Set this view as the entry's default thumbnail
        if updates.is_thumbnail:
            await self._set_entry_as_default_thumbnail(view)

        # Update view
        for key, value in updates.model_dump(exclude_unset=True).items():
            setattr(view, key, value)

        self.session.add(view)
        await self.session.commit()

        return ViewResponse.model_validate(view)

    async def reorder_views(
        self,
        user: User,
        entry_id: UUID,
        view_ids_in_order: list[UUID],
    ) -> list[ViewResponse]:
        entry: Entry = await self.entry_service._get_entry_by_id(entry_id)
        self._check_permissions(entry, user)

        # Fetch all views for the entry to ensure they belong to it
        result = await self.session.execute(
            select(View).where(View.entry_id == entry_id).options(selectinload(View.entry))
        )
        existing_views_map = {str(view.id): view for view in result.scalars().all()}

        if len(view_ids_in_order) != len(existing_views_map):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mismatched number of views. All views must be present in the reorder request.",
            )

        updated_views = []
        for index, view_id in enumerate(view_ids_in_order):
            if str(view_id) not in existing_views_map:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"View with ID {view_id} not found for this entry.",
                )
            view = existing_views_map[str(view_id)]
            view.order_index = index  # Assign new order based on list index
            self.session.add(view)
            updated_views.append(view)

        await self.session.commit()

        # Re-fetch views to ensure they are returned in the new order and refreshed
        result = await self.session.execute(
            select(View)
            .where(View.entry_id == entry_id)
            .options(selectinload(View.entry))
            .order_by(View.order_index)
        )
        return [ViewResponse.model_validate(view) for view in result.scalars().all()]

    # TODO: add soft delete
    async def delete(
        self,
        *,
        entry_id: UUID,
        view_id: UUID,
        user: User,
    ) -> UUID:
        # Get view
        view = await self._get_view_by_id(view_id)

        # Load in relationships
        await self.session.refresh(view, ["entry"])

        # Check permissions
        self._check_permissions(view.entry, user)

        # Delete associated files
        if view.snapshot_url:
            await self.storage.delete(
                file_path=view.snapshot_url,
            )
        if view.thumbnail_url:
            await self.storage.delete(
                file_path=view.thumbnail_url,
            )

        # Delete view
        await self.session.delete(view)
        await self.session.commit()

        # After deleting, re-index the remaining views to ensure contiguous order_index values
        await self._reindex_views_after_delete(entry_id)

        return view_id

    async def _reindex_views_after_delete(self, entry_id: UUID) -> None:
        result = await self.session.execute(
            select(View).where(View.entry_id == entry_id).order_by(View.order_index)
        )
        views = result.scalars().all()
        for index, view in enumerate(views):
            if view.order_index != index:
                view.order_index = index
                self.session.add(view)
        await self.session.commit()

    async def _set_entry_as_default_thumbnail(self, view: View) -> None:
        await self.session.execute(
            update(View)
            .where(View.entry_id == view.entry_id, View.is_thumbnail == True)
            .values(is_thumbnail=False)
        )
        await self.session.execute(update(View).where(View.id == view.id).values(is_thumbnail=True))
        await self.session.commit()

    async def _get_view_by_id(self, id: UUID) -> View:
        view: View | None = await self.session.get(View, id)
        if view is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="View not found",
            )
        return view

    async def _check_permissions(self, entry: Entry, user: User | None) -> bool:
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


async def get_view_service(
    session: AsyncSession = Depends(get_async_session),
    storage: BaseStorage = Depends(get_minio_storage),
    entry_service: EntryService = Depends(get_entry_service),
) -> ViewService:
    return ViewService(
        session=session,
        entry_service=entry_service,
        storage=storage,
    )
