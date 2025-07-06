from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from fastapi.utils import is_body_allowed_for_status_code


async def http_exception_handler(request: Request, exception: HTTPException) -> Response:
    headers = getattr(exception, "headers", None)
    if not is_body_allowed_for_status_code(exception.status_code):
        return Response(status_code=exception.status_code, headers=headers)
    response = JSONResponse(
        {"detail": exception.detail}, status_code=exception.status_code, headers=headers
    )
    # if exception.status_code == status.HTTP_401_UNAUTHORIZED:
    #     delete_jwt_tokens(response)

    return response
