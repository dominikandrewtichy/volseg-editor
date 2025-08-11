from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.contracts.responses.common import DebugModelName, Timestamp, Uuid


class EntryResponse(Timestamp, Uuid, DebugModelName, BaseModel):
    name: str = Field(min_length=1, max_length=255, examples=["Entry Name"])
    description: str | None = Field(default=None, examples=["Markdown description."])
    thumbnail_url: str | None = Field(default=None, examples=["URL for entry thumbnail preview"])
    is_public: bool
    volseg_entry_id: UUID

    model_config = ConfigDict(from_attributes=True)
