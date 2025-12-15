import os
import sys
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import status

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.v1.deps import get_required_user_from_state
from app.database.models.user_model import User
from app.main import app
from app.services.entry_service import EntryService, get_entry_service

# Mock User
mock_user = User(
    id=uuid4(),
    sub="test-sub",
    name="Test User",
    email="test@example.com",
    storage_quota=1000,
)

# Mock Service
mock_entry_service = AsyncMock(spec=EntryService)


@pytest.fixture
def override_deps():
    app.dependency_overrides[get_required_user_from_state] = lambda: mock_user
    app.dependency_overrides[get_entry_service] = lambda: mock_entry_service
    yield
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_list_user_entries_mocked(client, override_deps):
    """
    Test listing entries with a mocked service.
    """
    mock_entry_service.list_user_entries.return_value = ([], 0)

    response = await client.get("/api/v1/entries")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["items"] == []
    assert data["total_items"] == 0

    mock_entry_service.list_user_entries.assert_called_once()
    call_args = mock_entry_service.list_user_entries.call_args
    assert call_args.kwargs["user_id"] == mock_user.id
