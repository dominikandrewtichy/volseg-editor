from enum import Enum
from tempfile import TemporaryDirectory
from uuid import UUID

from fastapi import (
    BackgroundTasks,
)
from fastapi.responses import FileResponse

from app.api.v1.deps import (
    EntryServiceDep,
    ProcessingServiceDep,
)
from app.database.models.user_model import User


class DownloadFormat(str, Enum):
    MVSX = "mvsx"
    MVSTORY = "mvstory"


DOWNLOAD_CONFIG = {
    DownloadFormat.MVSX: {
        "media_type": "application/zip",
        "extension": ".mvsx",
    },
    DownloadFormat.MVSTORY: {
        "media_type": "application/zip",
        "extension": ".mvstory",
    },
}


def cleanup_temp_dir(temp_dir: TemporaryDirectory):
    temp_dir.cleanup()


async def handle_download(
    entry_id: UUID,
    user: User | None,
    entry_service: EntryServiceDep,
    processing_service: ProcessingServiceDep,
    background_tasks: BackgroundTasks,
    format_type: DownloadFormat,
) -> FileResponse:
    entry = await entry_service.get_entry_by_id(
        entry_id=entry_id,
        user=user,
    )

    temp_dir = TemporaryDirectory()
    background_tasks.add_task(cleanup_temp_dir, temp_dir)

    filepath = await processing_service.generate_export(
        target=format_type,
        internal_storage_key_prefix=entry.storage_key,
        tempdir=temp_dir.name,
    )

    config = DOWNLOAD_CONFIG[format_type]

    return FileResponse(
        path=filepath,
        media_type=config["media_type"],
        filename=f"{entry.name}{config['extension']}",
    )
