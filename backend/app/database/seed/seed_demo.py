import asyncio
import os
from uuid import UUID, uuid4

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings.minio_settings import get_minio_settings
from app.database.models.entry_model import Entry, EntryStatus
from app.database.models.share_link_model import ShareLink
from app.database.models.user_model import User
from app.database.session_manager import get_session_manager
from app.services.processing_service import ProcessingService
from app.services.storage_service import get_minio_client

SEED_FILES_DIR = "/app/app/database/seed/files"


def get_regular_user_id():
    return "11111111-1111-1111-a111-111111111111"


EXAMPLES = [
    {
        "id": UUID("22222222-2222-2222-a222-222222222222"),
        "filename": "emd-1832.cvsx",
        "name": "Drosophila melanogaster CMG complex bound to ADP.BeF3",
    },
    {
        "id": UUID("33333333-3333-3333-a333-333333333333"),
        "filename": "empiar-10070.cvsx",
        "name": "Focused Ion Beam-Scanning Electron Microscopy of mitochondrial reticulum in murine skeletal muscle.",
    },
    {
        "id": UUID("44444444-4444-4444-a444-444444444444"),
        "filename": "empiar_11756_ribosomes.cvsx",
        "name": "In situ cryo-ET dataset of Chlamydomonas reinhardtii.",
    },
]


async def get_or_create_demo_user(session: AsyncSession):
    result = await session.execute(select(User).where(User.id == get_regular_user_id()))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=get_regular_user_id(),
            sub=f"{uuid4()}@openid",
            name="Demo User",
            email="demo@viewer.app",
        )
        session.add(user)
        await session.flush()
        print("Created demo user.")
    else:
        print("Demo user already exists.")
    return user


async def seed_entry(session: AsyncSession, example: dict, user_id: UUID):
    entry_id = example["id"]
    filename = example["filename"]

    result = await session.execute(select(Entry).where(Entry.id == entry_id))
    existing_entry = result.scalar_one_or_none()

    if existing_entry:
        print(f"Entry {example['name']} already exists. Deleting to ensure clean state...")

        await session.execute(delete(ShareLink).where(ShareLink.entry_id == entry_id))

        await session.execute(delete(Entry).where(Entry.id == entry_id))

        await session.commit()
        print(f"Cleaned up previous data for {example['name']}.")

    filepath = os.path.join(SEED_FILES_DIR, filename)
    if not os.path.exists(filepath):
        print(f"WARNING: File {filepath} not found. Skipping seed for {example['name']}.")
        return

    print(f"Seeding {example['name']}...")

    minio = get_minio_client()
    settings = get_minio_settings()

    storage_key_prefix = f"datasets/{entry_id}"
    raw_storage_key = f"temp/{entry_id}.cvsx"

    file_size = os.path.getsize(filepath)

    try:
        with open(filepath, "rb") as f:
            minio.put_object(
                bucket_name=settings.MINIO_BUCKET,
                object_name=raw_storage_key,
                data=f,
                length=file_size,
                content_type="application/octet-stream",
            )
    except Exception as e:
        print(f"CRITICAL: Failed to upload raw file to MinIO: {e}")
        return

    entry = Entry(
        id=entry_id,
        name=example["name"],
        title=example["name"],
        storage_key=storage_key_prefix,
        size_bytes=file_size,
        owner_id=user_id,
        status=EntryStatus.PENDING,
    )
    session.add(entry)

    share_link = ShareLink(
        id=entry_id,
        entry_id=entry.id,
        is_active=True,
    )
    session.add(share_link)

    await session.commit()

    print(f"Processing conversion for {example['name']}...")

    try:
        await ProcessingService.process_entry_conversion(
            entry_id=entry.id,
            cvsx_storage_key=raw_storage_key,
            internal_storage_key_prefix=storage_key_prefix,
        )

        async with get_session_manager().session() as verify_session:
            result = await verify_session.execute(select(Entry).where(Entry.id == entry_id))
            updated_entry = result.scalar_one_or_none()

            if not updated_entry:
                print(f"ERROR: Entry vanished after processing: {example['name']}")
            elif updated_entry.status == EntryStatus.COMPLETED:
                print(f"Successfully seeded and processed: {example['name']}")
            elif updated_entry.status == EntryStatus.FAILED:
                print(
                    f"FAILED to process {example['name']}. Error from DB: {updated_entry.error_message}"
                )
            else:
                print(
                    f"WARNING: Entry stuck in status {updated_entry.status}. It might have failed silently."
                )

    except Exception as e:
        print(f"Exception during processing invocation {example['name']}: {e}")


async def seed_data():
    async with get_session_manager().session() as session:
        user = await get_or_create_demo_user(session)
        await session.commit()

        for example in EXAMPLES:
            await seed_entry(session, example, user.id)

        print("Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_data())
