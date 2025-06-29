from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Path, status

from app.api.v1.contracts.requests.volseg_requests import VolsegUploadEntry
from app.api.v1.contracts.responses.volseg_responses import VolsegEntryResponse
from app.api.v1.deps import OptionalUserDep, RequireUserDep, VolsegServiceDep
from app.api.v1.tags import Tags

router = APIRouter(prefix="/volseg", tags=[Tags.volseg])


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    response_model=VolsegEntryResponse,
)
async def upload_entry(
    request: Annotated[VolsegUploadEntry, File()],
    current_user: RequireUserDep,
    volseg_service: VolsegServiceDep,
):
    return await volseg_service.create(
        user=current_user,
        request=request,
    )


@router.get(
    "/{volseg_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=VolsegEntryResponse,
)
async def get_entry_by_id(
    volseg_entry_id: Annotated[UUID, Path(title="Volseg Entry ID")],
    current_user: OptionalUserDep,
    volseg_service: VolsegServiceDep,
):
    return await volseg_service.get_entry_by_id(
        user=current_user,
        volseg_entry_id=volseg_entry_id,
    )


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=list[VolsegEntryResponse],
)
async def list_public_entries(
    volseg_service: VolsegServiceDep,
):
    return await volseg_service.list_public_entries()


@router.delete(
    "/{volseg_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=UUID,
)
async def delete_view(
    volseg_entry_id: Annotated[UUID, Path(title="Volseg Entry ID")],
    current_user: RequireUserDep,
    volseg_service: VolsegServiceDep,
):
    return await volseg_service.delete(
        user=current_user,
        id=volseg_entry_id,
    )
