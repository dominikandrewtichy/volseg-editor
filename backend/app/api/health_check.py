from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.contracts.responses import HealthCheckResponse
from app.database.session_manager import get_session_manager
from app.services.storage_service import get_minio_client

health_check_router = APIRouter(tags=["Health Check"])


@health_check_router.get(
    "/health_check",
    response_model=HealthCheckResponse,
    responses={
        200: {
            "description": "Service is healthy",
            "model": HealthCheckResponse,
        },
        503: {
            "description": "Service is unhealthy - one or more dependencies are unavailable",
            "model": HealthCheckResponse,
        },
    },
)
async def health_check():
    health_status = HealthCheckResponse()

    try:
        async with get_session_manager().connect() as connection:
            await connection.execute(text("SELECT 1"))
        health_status.database = "healthy"
    except Exception as e:
        print(f"Health Check DB Error: {e}")
        health_status.database = "unhealthy"
        health_status.api = "unhealthy"

    try:
        minio = get_minio_client()
        minio.list_buckets()
        health_status.storage = "healthy"
    except Exception as e:
        print(f"Health Check Storage Error: {e}")
        health_status.storage = "unhealthy"
        health_status.api = "unhealthy"

    if health_status.api == "unhealthy":
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    else:
        health_status.api = "healthy"
        status_code = status.HTTP_200_OK

    return JSONResponse(
        status_code=status_code,
        content=health_status.model_dump(),
    )
