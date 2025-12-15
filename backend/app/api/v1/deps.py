from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.database.models.user_model import User
from app.services.api_key_service import ApiKeyService, get_api_key_service
from app.services.auth_service import AuthService, get_auth_service
from app.services.entry_service import EntryService, get_entry_service
from app.services.processing_service import ProcessingService, get_processing_service
from app.services.share_link_service import ShareLinkService, get_share_link_service
from app.services.user_service import UserService, get_user_service


def get_required_user_from_state(request: Request) -> User:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user


def get_optional_user_from_state(request: Request) -> User | None:
    return getattr(request.state, "user", None)


ApiKeyServiceDep = Annotated[ApiKeyService, Depends(get_api_key_service)]
AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
EntryServiceDep = Annotated[EntryService, Depends(get_entry_service)]
ProcessingServiceDep = Annotated[ProcessingService, Depends(get_processing_service)]
ShareLinkServiceDep = Annotated[ShareLinkService, Depends(get_share_link_service)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]


RequireUserDep = Annotated[User, Depends(get_required_user_from_state)]
OptionalUserDep = Annotated[User | None, Depends(get_optional_user_from_state)]
