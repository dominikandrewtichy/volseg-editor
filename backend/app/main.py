from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from starlette.middleware.sessions import SessionMiddleware

from app.api.v1.api import v1_api_router
from app.api.v1.tags import v1_api_tags_metadata
from app.core.settings import get_settings
from app.database.session_manager import get_session_manager


# for SDK
def generate_unique_id_function(route: APIRoute):
    prefix = route.tags[0] if route.tags else "other"
    return f"{prefix}-{route.name}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown
    if get_session_manager().engine is not None:
        await get_session_manager().close()


app = FastAPI(
    title=get_settings().APP_NAME,
    summary=get_settings().APP_SUMMARY,
    version=get_settings().APP_VERSION,
    contact=get_settings().APP_CONTACT,
    license_info=get_settings().APP_LICENCE,
    openapi_url=get_settings().API_OPENAPI_URL,
    openapi_tags=v1_api_tags_metadata,
    generate_unique_id_function=generate_unique_id_function,
    lifespan=lifespan,
)

# routes
app.include_router(v1_api_router)

# middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.add_middleware(
    SessionMiddleware,
    secret_key=get_settings().COOKIE_SESSION_SECRET,
)

# app.add_exception_handler(HTTPException, http_exception_handler)
