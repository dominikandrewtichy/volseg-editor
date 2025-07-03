import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

from app.api.v1.contracts.responses.user_responses import UserResponse
from app.api.v1.deps import OptionalUserDep, RequireUserDep, UserServiceDep
from app.api.v1.tags import Tags
from app.core.security import create_access_token
from app.core.settings import get_settings
from app.database.models.user_model import User

router = APIRouter(prefix="/auth", tags=[Tags.auth])


def pretty(d, indent=0):
    for key, value in d.items():
        print("\t" * indent + str(key))
        if isinstance(value, dict):
            pretty(value, indent + 1)
        else:
            print("\t" * (indent + 1) + str(value))


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

    print("authorizationUrl", authorization_url)

    return RedirectResponse(authorization_url)


@router.get("/callback")
async def oidc_callback(
    code: str,
    state: str,
    request: Request,
    service: UserServiceDep,
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

    pretty(response_data)

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

    pretty(user_info)

    openid: str | None = user_info.get("sub")
    name: str | None = user_info.get("name")
    email: str | None = user_info.get("email")

    if not openid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sub claim not provided",
        )

    # Create user in DB if they don't exist
    user: User | None = await service.get_user_by_openid(openid=openid)
    if not user:
        user: User = await service.create_user(
            openid=openid,
            name=name,
            email=email,
        )

    print(user.id)

    # Create and set JWT tokens
    jwt_token = create_access_token(data={"sub": str(user.id)})
    redirect_path = request.session.get("redirect_after_login") or "/dashboard"
    redirect_response = RedirectResponse(url=f"{get_settings().WEB_SERVER_URL}{redirect_path}")
    redirect_response.set_cookie(
        key=get_settings().JWT_ACCESS_TOKEN_COOKIE,
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="Lax",
    )
    redirect_response.set_cookie(
        key=get_settings().JWT_REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
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


@router.get(
    "/me/user",
    status_code=status.HTTP_200_OK,
    response_model=UserResponse,
)
async def read_users_me(
    current_user: RequireUserDep,
):
    return UserResponse.model_validate(current_user)


@router.get(
    "/me/token",
    status_code=status.HTTP_200_OK,
    response_model=str | None,
)
async def get_users_token(
    request: Request,
):
    return request.cookies.get(
        get_settings().JWT_ACCESS_TOKEN_COOKIE,
    )


@router.get(
    "/verify",
    status_code=status.HTTP_200_OK,
    response_model=bool,
)
async def verify_auth(
    current_user: OptionalUserDep,
):
    return current_user is not None
