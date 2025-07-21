from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Form, Path, Response, UploadFile, status

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
    name: Annotated[str, Form(min_length=1, max_length=255)],
    is_public: Annotated[bool, Form()],
    cvsx_file: Annotated[UploadFile, File()],
    snapshot_file: Annotated[UploadFile | None, File()],
    current_user: RequireUserDep,
    service: VolsegServiceDep,
):
    return await service.create(
        name=name,
        is_public=is_public,
        cvsx_file=cvsx_file,
        snapshot_file=snapshot_file,
        user=current_user,
    )


@router.get(
    "/{volseg_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=VolsegEntryResponse,
)
async def get_entry_by_id(
    volseg_entry_id: Annotated[UUID, Path(title="Volseg Entry ID")],
    current_user: OptionalUserDep,
    service: VolsegServiceDep,
):
    return await service.get_entry_by_id(
        user=current_user,
        volseg_entry_id=volseg_entry_id,
    )


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=list[VolsegEntryResponse],
)
async def list_public_entries(
    service: VolsegServiceDep,
):
    return await service.list_public_entries()


@router.get(
    "/{volseg_entry_id}/data",
    status_code=status.HTTP_200_OK,
    response_class=Response,
)
async def get_cvsx_file(
    volseg_entry_id: Annotated[UUID, Path(title="Entry ID")],
    current_user: OptionalUserDep,
    service: VolsegServiceDep,
):
    return await service.get_file(
        id=volseg_entry_id,
        user=current_user,
        file="cvsx",
    )


@router.get(
    "/{volseg_entry_id}/snapshot",
    status_code=status.HTTP_200_OK,
    response_class=Response,
)
async def get_snapshot_file(
    volseg_entry_id: Annotated[UUID, Path(title="Entry ID")],
    current_user: OptionalUserDep,
    service: VolsegServiceDep,
):
    return await service.get_file(
        id=volseg_entry_id,
        user=current_user,
        file="snapshot",
    )


@router.get(
    "/{volseg_entry_id}/annotations",
    status_code=status.HTTP_200_OK,
    response_class=Response,
)
async def get_annotations_file(
    volseg_entry_id: Annotated[UUID, Path(title="Entry ID")],
    current_user: OptionalUserDep,
    service: VolsegServiceDep,
):
    return await service.get_file(
        id=volseg_entry_id,
        user=current_user,
        file="annotations",
    )


@router.delete(
    "/{volseg_entry_id}",
    status_code=status.HTTP_200_OK,
    response_model=UUID,
)
async def delete_entry(
    volseg_entry_id: Annotated[UUID, Path(title="Volseg Entry ID")],
    current_user: RequireUserDep,
    service: VolsegServiceDep,
):
    return await service.delete(
        user=current_user,
        id=volseg_entry_id,
    )
