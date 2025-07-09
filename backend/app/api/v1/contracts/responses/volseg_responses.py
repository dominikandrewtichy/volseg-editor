from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.contracts.responses.common import DebugModelName, Timestamp, Uuid


class Segment(DebugModelName, BaseModel):
    name: str
    segmentation_id: str
    segment_id: int
    kind: Literal["lattice", "mesh", "primitive"]
    time: int | list[int] = Field(default=0)


class Volume(DebugModelName, BaseModel):
    channelId: int = Field(default=0)


class Annotations(DebugModelName, BaseModel):
    entry_id: str
    segments: list[Segment]
    volumes: list[Volume]


class VolsegEntryResponse(Timestamp, Uuid, DebugModelName, BaseModel):
    name: str = Field(max_length=255)
    is_public: bool = Field()
    cvsx_url: str | None = Field(max_length=2083)
    snapshot_url: str | None = Field(max_length=2083)
    annotations: Annotations | None = Field(default=None)

    model_config = ConfigDict(from_attributes=True)
