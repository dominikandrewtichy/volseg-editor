from typing import Annotated
from uuid import UUID

from cvsx2mvsx.models.internal.entry import InternalEntry
from fastapi import APIRouter, BackgroundTasks, Body, Path, Query, status

from app.api.v1.contracts.requests import ShareLinkDownloadQuery, ShareLinkUpdateRequest
from app.api.v1.contracts.responses import EntryResponse, ShareLinkResponse
from app.api.v1.deps import (
    EntryServiceDep,
    OptionalUserDep,
    ProcessingServiceDep,
    RequireUserDep,
    ShareLinkServiceDep,
)
from app.api.v1.endpoints.common import handle_download
from app.api.v1.tags import Tags

router = APIRouter(prefix="/share_links", tags=[Tags.share_links])


@router.get(
    "/{share_link_id}/entry",
    status_code=status.HTTP_200_OK,
    response_model=EntryResponse,
)
async def get_entry_by_share_link(
    share_link_id: Annotated[UUID, Path(title="Share Link ID")],
    service: ShareLinkServiceDep,
):
    return await service.get_entry_from_share_link(
        share_link_id=share_link_id,
    )


@router.get(
    "/{share_link_id}/model",
    status_code=status.HTTP_200_OK,
    response_model=InternalEntry,
)
async def get_entry_model(
    share_link_id: Annotated[UUID, Path(title="Share Link ID")],
    entry_service: EntryServiceDep,
    link_service: ShareLinkServiceDep,
    user: OptionalUserDep,
):
    entry = await link_service.get_entry_from_share_link(
        share_link_id=share_link_id,
    )

    return await entry_service.get_internal_model(
        entry_id=entry.id,
        user=None,
    )


@router.get(
    "/{share_link_id}/download",
    status_code=status.HTTP_200_OK,
)
async def download(
    share_link_id: Annotated[UUID, Path(title="Share Link ID")],
    query: Annotated[ShareLinkDownloadQuery, Query(title="Download format")],
    entry_service: EntryServiceDep,
    link_service: ShareLinkServiceDep,
    processing_service: ProcessingServiceDep,
    background_tasks: BackgroundTasks,
):
    entry = await link_service.get_entry_from_share_link(
        share_link_id=share_link_id,
    )
    return await handle_download(
        entry_id=entry.id,
        format_type=query.format_type,
        entry_service=entry_service,
        processing_service=processing_service,
        user=None,
        background_tasks=background_tasks,
    )


@router.put(
    "/{share_link_id}",
    status_code=status.HTTP_200_OK,
    response_model=ShareLinkResponse,
)
async def update_share_link(
    share_link_id: Annotated[UUID, Path(title="Share Link ID")],
    request: Annotated[ShareLinkUpdateRequest, Body()],
    service: ShareLinkServiceDep,
    user: RequireUserDep,
):
    return await service.update(
        share_link_id=share_link_id,
        user=user,
        is_active=request.is_active,
    )
