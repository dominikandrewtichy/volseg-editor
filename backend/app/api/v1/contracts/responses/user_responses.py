from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.contracts.responses.common import DebugModelName, Timestamp, Uuid


class UserResponse(Timestamp, Uuid, DebugModelName, BaseModel):
    openid: str = Field()
    email: str = Field()

    model_config = ConfigDict(from_attributes=True)
