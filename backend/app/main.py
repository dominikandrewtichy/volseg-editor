from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from starlette.middleware.sessions import SessionMiddleware

from app.api.health_check import health_check_router
from app.api.v1.api import v1_api_router
from app.api.v1.middleware.auth_middleware import AuthMiddleware
from app.api.v1.tags import v1_api_tags_metadata
from app.core.settings import get_settings
from app.core.settings.api_settings import get_api_settings
from app.core.settings.minio_settings import get_minio_settings
from app.database.session_manager import get_session_manager
from app.services.auth_service import AuthService
from app.services.storage_service import get_minio_client


# unique function naming for client library
def generate_unique_function_id(route: APIRoute):
    prefix = route.tags[0] if route.tags else "other"
    return f"{prefix}-{route.name}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    minio_client = get_minio_client()
    if not minio_client.bucket_exists(get_minio_settings().MINIO_BUCKET):
        minio_client.make_bucket(get_minio_settings().MINIO_BUCKET)
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
    lifespan=lifespan,
    openapi_tags=v1_api_tags_metadata,
    generate_unique_id_function=generate_unique_function_id,
)

# routes
app.include_router(health_check_router)
app.include_router(v1_api_router)

# middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_api_settings().CORS_ALLOW_ORIGINS,
    allow_methods=get_api_settings().CORS_ALLOW_METHODS,
    allow_headers=get_api_settings().CORS_ALLOW_HEADERS,
    allow_credentials=get_api_settings().CORS_ALLOW_CREDENTIALS,
)
app.add_middleware(
    SessionMiddleware,
    secret_key=get_settings().COOKIE_SESSION_SECRET,
)
app.add_middleware(
    AuthMiddleware,
    auth_service=AuthService(),
)
