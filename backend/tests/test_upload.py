from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import status

from app.api.v1.deps import get_required_user_from_state
from app.database.models.entry_model import Entry, EntryStatus
from app.database.models.share_link_model import ShareLink
from app.database.models.user_model import User
from app.main import app
from app.services.entry_service import EntryService, get_entry_service

mock_user = User(
    id=uuid4(),
    sub="test-sub-upload",
    name="Upload User",
    email="upload@example.com",
    storage_quota=10**9,  # 1GB quota
)

mock_entry_service = AsyncMock(spec=EntryService)


@pytest.fixture
def override_upload_deps():
    app.dependency_overrides[get_required_user_from_state] = lambda: mock_user
    app.dependency_overrides[get_entry_service] = lambda: mock_entry_service
    yield
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_upload_cvsx_success(client, override_upload_deps):
    entry_id = uuid4()

    # Mock the return value of create_entry
    mock_entry = Entry(
        id=entry_id,
        name="test_data.cvsx",
        status=EntryStatus.PENDING,
        size_bytes=1024,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        owner_id=mock_user.id,
        storage_key="datasets/test",
    )
    mock_entry.link = ShareLink(
        id=uuid4(),
        is_active=True,
        entry_id=entry_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    mock_entry_service.create_entry.return_value = mock_entry

    # Create dummy file payload
    files = {
        "dataset_file": ("test_data.cvsx", b"dummy binary content", "application/octet-stream")
    }

    response = await client.post("/api/v1/entries", files=files)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "test_data.cvsx"
    assert data["status"] == "pending"

    # Verify the service was called
    mock_entry_service.create_entry.assert_called_once()
