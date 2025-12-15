from typing import Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from app.database.models.entry_model import EntryStatus


class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UuidResponseMixin(BaseResponse):
    id: UUID = Field(examples=["6cfec811-c860-4727-a0ba-a6482b8d29cc"])


class TimestampResponseMixin(BaseResponse):
    created_at: AwareDatetime = Field(examples=["2025-04-24 09:46:15.895023+00:00"])
    updated_at: AwareDatetime = Field(examples=["2025-04-24 09:46:15.895023+00:00"])


class UserResponse(TimestampResponseMixin, UuidResponseMixin, BaseResponse):
    sub: str
    name: str | None
    email: str | None
    storage_quota: int
    storage_usage: int


class ShareLinkResponse(TimestampResponseMixin, UuidResponseMixin, BaseResponse):
    is_active: bool


class EntryResponse(TimestampResponseMixin, UuidResponseMixin, BaseResponse):
    name: str
    title: str | None
    description: str | None
    status: EntryStatus
    share_link: ShareLinkResponse = Field(validation_alias="link")
    size_bytes: int
    error_message: str | None


class PaginatedResponse[T](BaseResponse):
    page: int = Field(ge=1)
    per_page: int = Field(ge=1, le=100)
    total_pages: int
    total_items: int
    items: list[T]


class ApiKeyResponse(TimestampResponseMixin, UuidResponseMixin, BaseResponse):
    name: str
    prefix: str
    expires_at: AwareDatetime | None
    last_used_at: AwareDatetime | None


class ApiKeyCreatedResponse(ApiKeyResponse):
    key: str = Field(description="The raw API key. Only returned once upon creation.")


HealthStatus = Literal["unknown", "healthy", "unhealthy"]


class HealthCheckResponse(BaseResponse):
    api: HealthStatus = "unknown"
    database: HealthStatus = "unknown"
    storage: HealthStatus = "unknown"
