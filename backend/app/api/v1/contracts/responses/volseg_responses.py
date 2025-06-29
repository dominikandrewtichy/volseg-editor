from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.contracts.responses.common import DebugModelName, Timestamp, Uuid


class VolsegEntryResponse(Timestamp, Uuid, DebugModelName, BaseModel):
    is_public: bool = Field()
    cvsx_filepath: str | None = Field(max_length=2083)

    model_config = ConfigDict(from_attributes=True)
