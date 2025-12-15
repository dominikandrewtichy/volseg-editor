from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import status

from app.api.v1.deps import get_required_user_from_state
from app.database.models.api_key_model import ApiKey
from app.database.models.user_model import User
from app.main import app
from app.services.api_key_service import ApiKeyService, get_api_key_service

# Mock User
mock_user = User(
    id=uuid4(),
    sub="test-sub-apikey",
    name="API Key User",
    email="apikey@example.com",
    storage_quota=1000,
)

# Mock Service
mock_service = AsyncMock(spec=ApiKeyService)


@pytest.fixture
def override_deps():
    app.dependency_overrides[get_required_user_from_state] = lambda: mock_user
    app.dependency_overrides[get_api_key_service] = lambda: mock_service
    yield
    app.dependency_overrides = {}


@pytest.mark.asyncio
async def test_create_api_key(client, override_deps):
    payload = {"name": "Test Key", "expires_at": None}

    # Mock return value (tuple of ApiKey and raw_key)
    mock_key = ApiKey(
        id=uuid4(),
        name="Test Key",
        prefix="cv_1234567",
        owner_id=mock_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    mock_service.create_api_key.return_value = (mock_key, "cv_1234567890rawkey")

    response = await client.post("/api/v1/api-keys", json=payload)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Key"
    assert data["key"] == "cv_1234567890rawkey"
    assert "prefix" in data


@pytest.mark.asyncio
async def test_list_api_keys(client, override_deps):
    mock_service.list_keys.return_value = []

    response = await client.get("/api/v1/api-keys")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


@pytest.mark.asyncio
async def test_revoke_api_key(client, override_deps):
    key_id = uuid4()
    mock_service.revoke_key.return_value = None

    response = await client.delete(f"/api/v1/api-keys/{key_id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_service.revoke_key.assert_called_once()
