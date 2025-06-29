from fastapi import File, Form, UploadFile
from pydantic import BaseModel


class VolsegUploadEntry(BaseModel):
    is_public: bool | None = Form(default=False)
    cvsx_file: UploadFile = File(description="CVSX file")

    model_config = {"extra": "forbid"}
