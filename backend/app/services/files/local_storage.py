import shutil
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO, Union

from app.core.settings import get_settings


class LocalStorage:
    def __init__(self, root_path: str = "./storage"):
        self.root_path = Path(root_path)
        # Ensure root directory exists
        self.root_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file_path: str, file_data: Union[bytes, BinaryIO]) -> None:
        """Save file to local storage."""
        full_path = self.root_path / file_path.lstrip("/")
        full_path.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(file_data, bytes):
            with open(full_path, "wb") as f:
                f.write(file_data)
        else:
            with open(full_path, "wb") as f:
                shutil.copyfileobj(file_data, f)

    async def load(self, file_path: str) -> bytes:
        """Load file from local storage."""
        full_path = self.root_path / file_path.lstrip("/")
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        with open(full_path, "rb") as f:
            return f.read()

    async def delete(self, file_path: str) -> None:
        """Delete file from local storage."""
        full_path = self.root_path / file_path.lstrip("/")
        if full_path.exists():
            full_path.unlink()

    async def delete_directory(self, dir_path: str) -> None:
        """Delete directory and all its contents from local storage."""
        full_path = self.root_path / dir_path.lstrip("/")
        if full_path.exists():
            shutil.rmtree(full_path)

    async def exists(self, file_path: str) -> bool:
        """Check if file exists in local storage."""
        full_path = self.root_path / file_path.lstrip("/")
        return full_path.exists()


@lru_cache
def get_local_storage():
    settings = get_settings()
    storage = LocalStorage(
        root_path=settings.FILES_PATH_VOLSEG_ENTRIES,
    )
    return storage
