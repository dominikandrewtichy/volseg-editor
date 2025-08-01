from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Path, Query, status

from app.api.v1.contracts.requests.entry_requests import (
    EntryCreateRequest,
    EntryUpdateRequest,
    SearchQueryParams,
)
from app.api.v1.contracts.responses.entry_responses import (
    EntryResponse,
)
from app.api.v1.contracts.responses.pagination_response import PaginatedResponse
from app.api.v1.contracts.responses.share_link_responses import ShareLinkResponse
from app.api.v1.contracts.responses.view_responses import ViewResponse
from app.api.v1.deps import (
    EntryServiceDep,
    OptionalUserDep,
    RequireUserDep,
)
from app.api.v1.tags import Tags

router = APIRouter(prefix="/entries", tags=[Tags.entries])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=EntryResponse,
)
async def create_entry(
    request: Annotated[EntryCreateRequest, Body()],
    current_user: RequireUserDep,
    entry_service: EntryServiceDep,
):
    return await entry_service.create(
        user=current_user,
        request=request,
    )


@router.get(
    "/{entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=EntryResponse,
)
async def get_entry_by_id(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    current_user: OptionalUserDep,
    entry_service: EntryServiceDep,
):
    return await entry_service.get_entry(
        entry_id=entry_id,
        user=current_user,
    )


@router.get(
    "/share/{share_link_id}",
    status_code=status.HTTP_200_OK,
    response_model=EntryResponse,
)
async def get_entry_by_share_link(
    share_link_id: Annotated[UUID, Path(title="Share Link")],
    entry_service: EntryServiceDep,
):
    return await entry_service.get_entry_by_share_link(
        share_link_id=share_link_id,
    )


@router.get(
    "/{entry_id}/share_link",
    status_code=status.HTTP_200_OK,
    response_model=ShareLinkResponse,
)
async def get_entry_share_link(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    current_user: RequireUserDep,
    entry_service: EntryServiceDep,
):
    return await entry_service.get_entry_share_link(
        entry_id=entry_id,
        user=current_user,
    )


@router.get(
    "/{entry_id}/thumbnail",
    status_code=status.HTTP_200_OK,
    response_model=ViewResponse,
)
async def get_entry_thumbnail_view(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    current_user: OptionalUserDep,
    entry_service: EntryServiceDep,
):
    return await entry_service.get_entry_thumbnail_view(
        entry_id=entry_id,
        user=current_user,
    )


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginatedResponse[EntryResponse],
)
async def list_public_entries(
    search_query: Annotated[SearchQueryParams, Query()],
    entry_service: EntryServiceDep,
):
    return await entry_service.list_public_entries(
        search_query=search_query,
    )


@router.put(
    "/{entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=EntryResponse,
)
async def update_entry(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    request: Annotated[EntryUpdateRequest, Body()],
    entry_service: EntryServiceDep,
    current_user: RequireUserDep,
):
    return await entry_service.update(
        entry_id=entry_id,
        request=request,
        user=current_user,
    )


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=UUID,
)
async def delete_entry(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    entry_service: EntryServiceDep,
    current_user: RequireUserDep,
):
    return await entry_service.delete(
        entry_id=entry_id,
        user=current_user,
    )
