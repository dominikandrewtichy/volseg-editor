import shutil
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO, Union

from app.core.settings import get_settings
from app.services.files.base_storage import BaseStorage


class LocalStorage(BaseStorage):
    def __init__(self, root_path: str = "./storage"):
        self.root_path = Path(root_path)
        self.root_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file_path: str, file_data: Union[bytes, BinaryIO]) -> str:
        full_path = self.root_path / file_path.lstrip("/")
        full_path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(file_data, bytes):
            with open(full_path, "wb") as f:
                f.write(file_data)
        else:
            with open(full_path, "wb") as f:
                shutil.copyfileobj(file_data, f)
        return file_path

    async def get(self, file_path: str) -> bytes:
        full_path = self.root_path / file_path.lstrip("/")
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        with open(full_path, "rb") as f:
            return f.read()

    async def delete(self, file_path: str) -> bool:
        full_path = self.root_path / file_path.lstrip("/")
        if full_path.exists():
            full_path.unlink()
            return True
        return False

    async def delete_directory(self, dir_path: str) -> int:
        full_path = self.root_path / dir_path.lstrip("/")
        if full_path.exists():
            count = sum(1 for _ in full_path.rglob("*") if _.is_file())
            shutil.rmtree(full_path)
            return count
        return 0

    async def list_directory(self, prefix: str) -> list[str]:
        full_path = self.root_path / prefix.lstrip("/")
        if not full_path.exists() or not full_path.is_dir():
            return []
        return [str(p.relative_to(self.root_path)) for p in full_path.rglob("*") if p.is_file()]

    async def exists(self, file_path: str) -> bool:
        full_path = self.root_path / file_path.lstrip("/")
        return full_path.exists()


@lru_cache
def get_local_storage():
    settings = get_settings()
    storage = LocalStorage(
        root_path=settings.FILES_PATH_VOLSEG_ENTRIES,
    )
    return storage
