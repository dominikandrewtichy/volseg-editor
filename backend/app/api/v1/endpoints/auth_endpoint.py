import secrets
from datetime import timedelta
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

from app.api.v1.contracts.responses import UserResponse
from app.api.v1.deps import AuthServiceDep, RequireUserDep, UserServiceDep
from app.api.v1.tags import Tags
from app.core.settings import get_settings
from app.core.settings.api_settings import get_api_settings
from app.core.settings.base_settings import ModeEnum
from app.database.models.user_model import User
from app.database.seed.seed_demo import get_regular_user_id

router = APIRouter(prefix="/auth", tags=[Tags.auth])


@router.get(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=None,
)
async def login_user(
    request: Request,
    redirect: str = "/dashboard",
):
    state = secrets.token_urlsafe(16)
    request.session["oidc_state"] = state
    request.session["redirect_after_login"] = redirect
    query_params = {
        "response_type": "code",
        "client_id": get_settings().OIDC_CLIENT_ID,
        "redirect_uri": get_settings().OIDC_REDIRECT_URI,
        "scope": " ".join(get_settings().OIDC_SCOPES),
        "state": state,
    }
    query_string = urlencode(query_params)
    authorization_url = f"{get_settings().OIDC_AUTHORIZATION_URL}?{query_string}"

    return RedirectResponse(authorization_url)


@router.get("/callback")
async def oidc_callback(
    code: str,
    state: str,
    request: Request,
    user_service: UserServiceDep,
    auth_service: AuthServiceDep,
):
    # Validate that returned state matches session state
    session_state = request.session.get("oidc_state")
    if session_state != state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter",
        )

    # Exchange auth code for access token
    async with httpx.AsyncClient() as client:
        response = await client.post(
            get_settings().OIDC_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": get_settings().OIDC_REDIRECT_URI,
                "client_id": get_settings().OIDC_CLIENT_ID,
                "client_secret": get_settings().OIDC_CLIENT_SECRET,
            },
        )
        response_data = response.json()

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token request",
        )

    access_token = response_data.get("access_token")
    refresh_token = response_data.get("refresh_token")

    # Get user information
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            get_settings().OIDC_USERINFO_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
            },
        )
        user_info: dict[str, str] = user_response.json()

    sub: str | None = user_info.get("sub")
    name: str | None = user_info.get("name")
    email: str | None = user_info.get("email")

    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub claim not provided",
        )

    # Create user in DB if they don't exist
    user: User | None = await user_service.get_user_by_sub(sub=sub)
    if not user:
        user = await user_service.create_user(
            sub=sub,
            name=name,
            email=email,
        )

    # Create and set JWT tokens
    jwt_token = auth_service.create_access_token(data={"sub": str(user.id)})
    redirect_path = request.session.get("redirect_after_login") or "/dashboard"
    redirect_response = RedirectResponse(url=f"{get_settings().WEB_SERVER_URL}{redirect_path}")
    redirect_response.set_cookie(
        key=get_settings().JWT_ACCESS_TOKEN_COOKIE,
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    redirect_response.set_cookie(
        key=get_settings().JWT_REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return redirect_response


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    response_model=None,
)
async def logout(response: Response):
    response.delete_cookie(
        key=get_settings().JWT_ACCESS_TOKEN_COOKIE,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.delete_cookie(
        key=get_settings().JWT_REFRESH_TOKEN_COOKIE,
        httponly=True,
        secure=False,
        samesite="lax",
    )


@router.get(
    "/user",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
)
async def get_user(
    user: RequireUserDep,
    user_service: UserServiceDep,
):
    usage = await user_service.get_storage_usage(user.id)
    return UserResponse(
        id=user.id,
        created_at=user.created_at,
        updated_at=user.updated_at,
        sub=user.sub,
        name=user.name,
        email=user.email,
        storage_quota=user.storage_quota,
        storage_usage=usage,
    )


@router.get(
    "/verify",
    status_code=status.HTTP_200_OK,
    response_model=bool,
)
async def verify_auth(request: Request):
    return request.state.user is not None


if get_api_settings().MODE == ModeEnum.development:

    @router.get(
        "/demo-login",
        status_code=status.HTTP_200_OK,
    )
    async def demo_login(
        auth_service: AuthServiceDep,
        redirect: str = "/dashboard",
    ):
        jwt_token = auth_service.create_access_token(
            {"sub": get_regular_user_id()},
            expires_delta=timedelta(hours=10),
        )
        redirect_response = RedirectResponse(url=f"{get_settings().WEB_SERVER_URL}{redirect}")

        redirect_response.set_cookie(
            key=get_settings().JWT_ACCESS_TOKEN_COOKIE,
            value=jwt_token,
            httponly=True,
            secure=False,
            samesite="lax",
        )

        return redirect_response
