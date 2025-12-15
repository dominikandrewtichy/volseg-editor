from uuid import UUID

from fastapi import APIRouter, status

from app.api.v1.contracts.requests import CreateApiKeyRequest
from app.api.v1.contracts.responses import ApiKeyCreatedResponse, ApiKeyResponse
from app.api.v1.deps import ApiKeyServiceDep, RequireUserDep
from app.api.v1.tags import Tags

router = APIRouter(prefix="/api-keys", tags=[Tags.api_keys])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ApiKeyCreatedResponse,
)
async def create_api_key(
    request: CreateApiKeyRequest,
    user: RequireUserDep,
    service: ApiKeyServiceDep,
):
    api_key, raw_key = await service.create_api_key(user, request)
    return ApiKeyCreatedResponse(
        id=api_key.id,
        created_at=api_key.created_at,
        updated_at=api_key.updated_at,
        name=api_key.name,
        prefix=api_key.prefix,
        expires_at=api_key.expires_at,
        last_used_at=api_key.last_used_at,
        key=raw_key,
    )


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=list[ApiKeyResponse],
)
async def list_api_keys(
    user: RequireUserDep,
    service: ApiKeyServiceDep,
):
    return await service.list_keys(user)


@router.delete(
    "/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def revoke_api_key(
    key_id: UUID,
    user: RequireUserDep,
    service: ApiKeyServiceDep,
):
    await service.revoke_key(user, key_id)
