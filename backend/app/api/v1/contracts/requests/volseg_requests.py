from fastapi import UploadFile
from pydantic import BaseModel, Field


class VolsegUploadEntry(BaseModel):
    name: str = Field(max_length=255)
    is_public: bool = Field()
    cvsx_file: UploadFile = Field()

    model_config = {"extra": "forbid"}
