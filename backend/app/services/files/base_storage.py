from abc import ABC, abstractmethod
from typing import BinaryIO, List, Union


class BaseStorage(ABC):
    @abstractmethod
    async def save(self, file_path: str, file_data: Union[bytes, BinaryIO]) -> str:
        """Save file and return file path or identifier."""
        pass

    @abstractmethod
    async def get(self, file_path: str) -> bytes:
        """Retrieve file data as bytes."""
        pass

    @abstractmethod
    async def delete(self, file_path: str) -> bool:
        """Delete file, return True if deleted, False if not found."""
        pass

    @abstractmethod
    async def delete_directory(self, prefix: str) -> int:
        """Delete directory or prefix, return number of deleted files."""
        pass

    @abstractmethod
    async def list_directory(self, prefix: str) -> List[str]:
        """List files under prefix."""
        pass

    @abstractmethod
    async def exists(self, file_path: str) -> bool:
        """Check if file exists."""
        pass
