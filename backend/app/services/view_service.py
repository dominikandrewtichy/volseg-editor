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

        # Get entry's views
        result = await self.session.execute(
            select(View).where(View.entry_id == entry_id).options(selectinload(View.entry)),
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

        return view_id

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
