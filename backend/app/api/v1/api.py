from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth_endpoint,
    entry_endpoint,
    me_endpoint,
    share_link_endpoint,
    view_endpoint,
    volseg_endpoint,
)
from app.core.settings import get_settings

v1_api_router = APIRouter(prefix=get_settings().API_V1_PREFIX)

v1_api_router.include_router(entry_endpoint.router)
v1_api_router.include_router(view_endpoint.router)
v1_api_router.include_router(me_endpoint.router)
v1_api_router.include_router(share_link_endpoint.router)
v1_api_router.include_router(auth_endpoint.router)
v1_api_router.include_router(volseg_endpoint.router)
