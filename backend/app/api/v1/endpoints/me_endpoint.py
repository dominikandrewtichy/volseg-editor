from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.v1.contracts.requests.entry_requests import (
    SearchQueryParams,
)
from app.api.v1.contracts.responses.entry_responses import (
    EntryResponse,
)
from app.api.v1.contracts.responses.pagination_response import PaginatedResponse
from app.api.v1.contracts.responses.volseg_responses import VolsegEntryResponse
from app.api.v1.deps import (
    EntryServiceDep,
    RequireUserDep,
    VolsegServiceDep,
)
from app.api.v1.tags import Tags

router = APIRouter(prefix="/me", tags=[Tags.me])


@router.get(
    "/entries",
    status_code=status.HTTP_200_OK,
    response_model=PaginatedResponse[EntryResponse],
)
async def list_entries_for_user(
    search_query: Annotated[SearchQueryParams, Query()],
    entry_service: EntryServiceDep,
    current_user: RequireUserDep,
):
    return await entry_service.list_user_entries(
        search_query=search_query,
        user_id=current_user.id,
    )


@router.get(
    "/volseg",
    status_code=status.HTTP_200_OK,
    response_model=list[VolsegEntryResponse],
)
async def list_volseg_entries_for_user(
    current_user: RequireUserDep,
    volseg_service: VolsegServiceDep,
):
    return await volseg_service.list_user_entries(
        user=current_user,
    )
