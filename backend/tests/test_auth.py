import pytest
from fastapi import status
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_redirect(client: AsyncClient):
    response = await client.get("/api/v1/auth/login", follow_redirects=False)

    assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
    assert "location" in response.headers
    assert "response_type=code" in response.headers["location"]
    assert "client_id=" in response.headers["location"]


@pytest.mark.asyncio
async def test_verify_auth_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/auth/verify")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() is False
