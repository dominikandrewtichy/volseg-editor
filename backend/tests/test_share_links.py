from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import status

from app.database.models.entry_model import Entry, EntryStatus
from app.database.models.share_link_model import ShareLink
from app.main import app
from app.services.share_link_service import ShareLinkService, get_share_link_service

mock_share_service = AsyncMock(spec=ShareLinkService)


@pytest.fixture
def override_share_deps():
    app.dependency_overrides[get_share_link_service] = lambda: mock_share_service
    yield
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_get_entry_by_share_link(client, override_share_deps):
    share_link_id = uuid4()
    entry_id = uuid4()

    # Prepare mock data
    mock_entry = Entry(
        id=entry_id,
        name="Shared Entry",
        status=EntryStatus.COMPLETED,
        size_bytes=100,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        owner_id=uuid4(),
        storage_key="test/key",
    )
    # The response model expects a 'share_link' relationship on the entry
    mock_entry.link = ShareLink(
        id=share_link_id,
        is_active=True,
        entry_id=entry_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    mock_share_service.get_entry_from_share_link.return_value = mock_entry

    response = await client.get(f"/api/v1/share_links/{share_link_id}/entry")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Shared Entry"
    assert data["share_link"]["id"] == str(share_link_id)
    assert data["share_link"]["is_active"] is True
