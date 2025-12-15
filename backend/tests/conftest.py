import os
import sys
from typing import AsyncGenerator

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.settings import get_settings
from app.core.settings.base_settings import ModeEnum
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def set_test_settings():
    settings = get_settings()
    settings.MODE = ModeEnum.testing


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
