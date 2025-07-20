from functools import lru_cache
from typing import BinaryIO

from minio import Minio
from minio.error import S3Error

from app.core.settings import get_settings
from app.services.files.base_storage import BaseStorage


class MinioStorage(BaseStorage):
    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket: str,
        secure: bool = False,
    ):
        self.client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)
        self.bucket = bucket
        if not self.client.bucket_exists(bucket):
            self.client.make_bucket(bucket)

    async def save(self, file_path: str, file_data: BinaryIO) -> str:
        try:
            file_data.seek(0, 2)
            file_size = file_data.tell()
            file_data.seek(0)
            self.client.put_object(
                self.bucket,
                file_path,
                file_data,
                file_size,
                content_type="application/octet-stream",
            )
            return file_path
        except S3Error as e:
            raise Exception(f"Error saving file to MinIO: {str(e)}")

    async def get(self, file_path: str) -> bytes:
        try:
            response = self.client.get_object(self.bucket, file_path)
            data = response.read()
            response.close()
            response.release_conn()
            return data
        except S3Error as e:
            if "NoSuchKey" in str(e):
                raise FileNotFoundError(f"File not found: {file_path}")
            raise Exception(f"Error getting file from MinIO: {str(e)}")

    async def delete(self, file_path: str) -> bool:
        try:
            self.client.remove_object(self.bucket, file_path)
            return True
        except S3Error as e:
            if "NoSuchKey" in str(e):
                return False
            raise Exception(f"Error deleting file from MinIO: {str(e)}")

    async def delete_directory(self, prefix: str) -> int:
        try:
            objects_to_delete = self.client.list_objects(self.bucket, prefix=prefix, recursive=True)
            deleted_count = 0
            for obj in objects_to_delete:
                self.client.remove_object(self.bucket, obj.object_name)
                deleted_count += 1
            return deleted_count
        except S3Error as e:
            raise Exception(f"Error deleting directory from MinIO: {str(e)}")

    async def list_directory(self, prefix: str) -> list[str]:
        return [
            obj.object_name
            for obj in self.client.list_objects(self.bucket, prefix=prefix, recursive=True)
        ]

    async def exists(self, file_path: str) -> bool:
        try:
            self.client.stat_object(self.bucket, file_path)
            return True
        except S3Error as e:
            if "NoSuchKey" in str(e):
                return False
            raise Exception(f"Error checking file existence on MinIO: {str(e)}")


@lru_cache
def get_minio_storage():
    settings = get_settings()
    storage = MinioStorage(
        endpoint=settings.MINIO_ENDPOINT,
        bucket=settings.MINIO_BUCKET,
        access_key=settings.MINIO_ROOT_USER,
        secret_key=settings.MINIO_ROOT_PASSWORD,
        secure=settings.MINIO_SECURE,
    )
    return storage
