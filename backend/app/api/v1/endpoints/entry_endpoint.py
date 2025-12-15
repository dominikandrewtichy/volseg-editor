from math import ceil
from typing import Annotated
from uuid import UUID

from cvsx2mvsx.models.internal.entry import InternalEntry
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    File,
    Path,
    Query,
    UploadFile,
    status,
)

from app.api.v1.contracts.requests import (
    EntryDownloadQuery,
    EntryPaginationQuery,
    EntryUpdateRequest,
)
from app.api.v1.contracts.responses import EntryResponse, PaginatedResponse, ShareLinkResponse
from app.api.v1.deps import (
    EntryServiceDep,
    ProcessingServiceDep,
    RequireUserDep,
)
from app.api.v1.endpoints.common import handle_download
from app.api.v1.tags import Tags

router = APIRouter(prefix="/entries", tags=[Tags.entries])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=EntryResponse,
)
async def upload_cvsx(
    dataset_file: Annotated[UploadFile, File()],
    entry_service: EntryServiceDep,
    user: RequireUserDep,
    background_tasks: BackgroundTasks,
    lattice_to_mesh: bool = Query(
        True, description="Transform lattice to mesh (True) or volume (False)"
    ),
):
    return await entry_service.create_entry(
        user=user,
        dataset_file=dataset_file,
        background_tasks=background_tasks,
        lattice_to_mesh=lattice_to_mesh,
    )


@router.get(
    "/{entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=EntryResponse,
)
async def get_entry_by_id(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    entry_service: EntryServiceDep,
    user: RequireUserDep,
):
    return await entry_service.get_entry_by_id(
        entry_id=entry_id,
        user=user,
    )


@router.get(
    "/{entry_id}/share-link",
    status_code=status.HTTP_200_OK,
    response_model=ShareLinkResponse,
)
async def get_entry_share_link(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    entry_service: EntryServiceDep,
    user: RequireUserDep,
):
    return await entry_service.get_entry_share_link(
        entry_id=entry_id,
        user=user,
    )


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginatedResponse[EntryResponse],
)
async def list_user_entries(
    pagination_query: Annotated[EntryPaginationQuery, Query(title="Pagination")],
    entry_service: EntryServiceDep,
    user: RequireUserDep,
):
    entries, total_items = await entry_service.list_user_entries(
        user_id=user.id,
        page=pagination_query.page,
        per_page=pagination_query.per_page,
        sort_by=pagination_query.sort_by,
        sort_order=pagination_query.sort_order,
    )

    total_pages = ceil(total_items / pagination_query.per_page)

    return PaginatedResponse(
        page=pagination_query.page,
        per_page=pagination_query.per_page,
        total_pages=total_pages,
        total_items=total_items,
        items=list(entries),
    )


@router.get(
    "/{entry_id}/model",
    status_code=status.HTTP_200_OK,
    response_model=InternalEntry,
)
async def get_entry_model(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    entry_service: EntryServiceDep,
    user: RequireUserDep,
):
    return await entry_service.get_internal_model(
        entry_id=entry_id,
        user=user,
    )


@router.get(
    "/{entry_id}/download",
    status_code=status.HTTP_200_OK,
)
async def download(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    query: Annotated[EntryDownloadQuery, Query(title="Download format")],
    entry_service: EntryServiceDep,
    processing_service: ProcessingServiceDep,
    user: RequireUserDep,
    background_tasks: BackgroundTasks,
):
    return await handle_download(
        entry_id=entry_id,
        format_type=query.format_type,
        entry_service=entry_service,
        processing_service=processing_service,
        user=user,
        background_tasks=background_tasks,
    )


@router.put(
    "/{entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=EntryResponse,
)
async def update_entry(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    update_request: EntryUpdateRequest,
    entry_service: EntryServiceDep,
    user: RequireUserDep,
):
    return await entry_service.update_entry(
        entry_id=entry_id,
        user=user,
        name=update_request.name,
        title=update_request.title,
        description=update_request.description,
    )


@router.put(
    "/{entry_id}/model",
    status_code=status.HTTP_200_OK,
    response_model=InternalEntry,
)
async def update_entry_model(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    model: Annotated[InternalEntry, Body(title="Internal Model JSON")],
    entry_service: EntryServiceDep,
    user: RequireUserDep,
):
    return await entry_service.update_internal_model(
        entry_id=entry_id,
        user=user,
        model=model,
    )


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=None,
)
async def delete_entry(
    entry_id: Annotated[UUID, Path(title="Entry ID")],
    user: RequireUserDep,
    entry_service: EntryServiceDep,
):
    await entry_service.delete_entry(
        entry_id=entry_id,
        user=user,
    )
