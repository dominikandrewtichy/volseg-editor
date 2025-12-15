from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class BaseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")


class EntryUpdateRequest(BaseRequest):
    name: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=2047)


class EntryDownloadQuery(BaseRequest):
    format_type: Literal["mvsx", "mvstory"] = Field(default="mvsx")


class EntryPaginationQuery(BaseRequest):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1, le=100)
    sort_by: Literal["name", "size_bytes", "created_at", "status"] = Field(default="created_at")
    sort_order: Literal["asc", "desc"] = Field(default="desc")


class ShareLinkUpdateRequest(BaseRequest):
    is_active: bool = Field(description="Whether the share link is active")


class ShareLinkDownloadQuery(BaseRequest):
    format_type: Literal["mvsx", "mvstory"] = Field(default="mvsx")


class CreateApiKeyRequest(BaseRequest):
    name: str = Field(min_length=1, max_length=255, description="Friendly name for the key")
    expires_at: datetime | None = Field(default=None, description="Optional expiration date")
