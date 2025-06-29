from fastapi import File, Form, UploadFile
from pydantic import BaseModel


class VolsegUploadEntry(BaseModel):
    is_public: bool = Form()
    cvsx_file: UploadFile = File()

    model_config = {"extra": "forbid"}
