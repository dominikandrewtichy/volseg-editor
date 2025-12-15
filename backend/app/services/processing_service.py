import os
from tempfile import TemporaryDirectory
from typing import Literal
from uuid import UUID

from cvsx2mvsx.etl.pipelines.config import PipelineConfig
from cvsx2mvsx.etl.pipelines.pipeline import Pipeline
from cvsx2mvsx.etl.pipelines.pipeline_steps import (
    ExtractCVSX,
    ExtractInternal,
    LoadInternal,
    LoadMVStory,
    LoadMVSX,
    TransformToInternal,
    TransformToMVStory,
    TransformToMVSX,
)
from fastapi.concurrency import run_in_threadpool

from app.core.settings.minio_settings import get_minio_settings
from app.database.models.entry_model import EntryStatus
from app.database.session_manager import get_session_manager
from app.repositories.entry_repository import EntryRepository
from app.services.storage_service import get_minio_client


class ProcessingService:
    def __init__(self):
        pass

    @staticmethod
    async def process_entry_conversion(
        entry_id: UUID,
        cvsx_storage_key: str,
        internal_storage_key_prefix: str,
        lattice_to_mesh: bool = True,
    ):
        minio = get_minio_client()
        settings = get_minio_settings()

        async with get_session_manager().session() as session:
            entry_repo = EntryRepository(session)
            try:
                entry = await entry_repo.get_by_id(entry_id)
                if not entry:
                    return

                entry.status = EntryStatus.PROCESSING
                await entry_repo.commit()

                await ProcessingService._conversion_helper(
                    cvsx_storage_key=cvsx_storage_key,
                    internal_storage_key_prefix=internal_storage_key_prefix,
                    lattice_to_mesh=lattice_to_mesh,
                )

                entry.status = EntryStatus.COMPLETED
                await entry_repo.commit()

                minio.remove_object(
                    bucket_name=settings.MINIO_BUCKET,
                    object_name=cvsx_storage_key,
                )
            except Exception as e:
                entry = await entry_repo.get_by_id(entry_id)
                if entry:
                    entry.status = EntryStatus.FAILED
                    entry.error_message = str(e)
                    await entry_repo.commit()

    @staticmethod
    async def _conversion_helper(
        cvsx_storage_key: str,
        internal_storage_key_prefix: str,
        lattice_to_mesh: bool = True,
    ):
        minio = get_minio_client()
        settings = get_minio_settings()

        with TemporaryDirectory() as tempdir:
            cvsx_path = os.path.join(tempdir, "input.cvsx")

            try:
                response = minio.get_object(
                    bucket_name=settings.MINIO_BUCKET,
                    object_name=cvsx_storage_key,
                )
                with open(cvsx_path, "wb") as f:
                    for d in response.stream(32 * 1024):
                        f.write(d)
                response.close()
                response.release_conn()
            except Exception as e:
                raise Exception(f"Failed to download input CVSX file: {e}")

            try:
                config = PipelineConfig(
                    input_path=cvsx_path,
                    output_path=tempdir,
                    lattice_to_mesh=lattice_to_mesh,
                )
                pipeline = Pipeline(
                    [
                        ExtractCVSX(),
                        TransformToInternal(),
                        LoadInternal(),
                    ]
                )
                await run_in_threadpool(lambda: pipeline.run(config))
            except Exception as e:
                raise Exception(f"Conversion failed: {e}")

            try:
                for root, dirs, files in os.walk(tempdir):
                    for file in files:
                        if file == "input.cvsx":
                            continue
                        filepath = os.path.join(root, file)
                        relative_path = os.path.relpath(filepath, tempdir)
                        storage_key = f"{internal_storage_key_prefix}/{relative_path}"
                        file_size = os.path.getsize(filepath)
                        with open(filepath, "rb") as f:
                            minio.put_object(
                                bucket_name=settings.MINIO_BUCKET,
                                object_name=storage_key,
                                data=f,
                                length=file_size,
                                content_type="application/zip",
                            )
            except Exception as e:
                raise Exception(f"Failed to upload result: {e}")

    async def generate_export(
        self,
        target: Literal["mvsx", "mvstory"],
        internal_storage_key_prefix: str,
        tempdir: str,
    ) -> str:
        minio = get_minio_client()
        settings = get_minio_settings()

        try:
            objects = minio.list_objects(
                bucket_name=settings.MINIO_BUCKET,
                prefix=internal_storage_key_prefix,
                recursive=True,
            )

            for obj in objects:
                if not obj.object_name.startswith(internal_storage_key_prefix):
                    continue

                relative_name = obj.object_name[len(internal_storage_key_prefix) :]
                if relative_name.startswith("/"):
                    relative_name = relative_name[1:]

                if not relative_name:
                    continue

                local_path = os.path.join(tempdir, relative_name)
                os.makedirs(os.path.dirname(local_path), exist_ok=True)

                response = minio.get_object(
                    bucket_name=settings.MINIO_BUCKET,
                    object_name=obj.object_name,
                )
                with open(local_path, "wb") as f:
                    for d in response.stream(32 * 1024):
                        f.write(d)
                response.close()
                response.release_conn()
        except Exception as e:
            raise Exception(f"Failed to download internal model files: {e}")

        output_path = os.path.join(tempdir, "output.mvsx")
        config = PipelineConfig(
            input_path=tempdir,
            output_path=output_path,
            lattice_to_mesh=True,
        )

        try:
            if target == "mvsx":
                pipeline = Pipeline(
                    [
                        ExtractInternal(),
                        TransformToMVSX(),
                        LoadMVSX(),
                    ]
                )
            else:
                pipeline = Pipeline(
                    [
                        ExtractInternal(),
                        TransformToMVStory(),
                        LoadMVStory(),
                    ]
                )
            await run_in_threadpool(lambda: pipeline.run(config))
        except Exception as e:
            raise Exception(f"MVSX conversion failed: {e}")

        return output_path


async def get_processing_service() -> ProcessingService:
    return ProcessingService()
