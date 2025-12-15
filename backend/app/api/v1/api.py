from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer

from app.api.v1.endpoints import (
    api_key_endpoint,
    auth_endpoint,
    entry_endpoint,
    share_link_endpoint,
)
from app.core.settings import get_settings

security = HTTPBearer(auto_error=False)

v1_api_router = APIRouter(
    prefix=get_settings().API_V1_PREFIX,
    dependencies=[Depends(security)],
)

v1_api_router.include_router(api_key_endpoint.router)
v1_api_router.include_router(auth_endpoint.router)
v1_api_router.include_router(entry_endpoint.router)
v1_api_router.include_router(share_link_endpoint.router)
