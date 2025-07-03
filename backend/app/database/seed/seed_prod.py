import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from app.core.settings import get_settings
from app.database.models.role_model import Role
from app.database.session_manager import get_session_manager


async def seed_data():
    async with get_session_manager(url=get_settings().POSTGRES_URL).session() as session:
        # Create roles
        await get_or_create_role(session, "user")
        await get_or_create_role(session, "admin")

        await session.commit()
        print("Database seeding complete!")


async def get_or_create_role(session: AsyncSession, role_name: str) -> Role:
    result = await session.execute(
        select(Role).where(Role.name == role_name),
    )
    role = result.scalar_one_or_none()

    if not role:
        role = Role(name=role_name)
        session.add(role)
        await session.flush()
        print(f"Created role: {role_name}")
    else:
        print(f"Role '{role_name}' already exists.")
    return role


if __name__ == "__main__":
    asyncio.run(seed_data())
