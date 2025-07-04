import asyncio
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from app.core.security import get_regular_user_id
from app.core.settings import get_settings
from app.database.models.role_model import Role
from app.database.models.user_model import User
from app.database.session_manager import get_session_manager


async def get_or_create_demo_user(session: AsyncSession, role: Role):
    demo_user_id = get_regular_user_id()
    result = await session.execute(select(User).where(User.id == demo_user_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=demo_user_id,
            openid=f"{uuid4()}@openid",
            email="demo@viewer.app",
            name="Demo User",
            role=role,
        )
        session.add(user)
        print("Created demo user.")
    else:
        print("Demo user already exists.")
    return user


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


async def seed_data():
    async with get_session_manager().session() as session:
        # Create roles
        user_role = await get_or_create_role(session, "user")
        admin_role = await get_or_create_role(session, "admin")

        # Create users
        await get_or_create_demo_user(session, user_role)

        await session.commit()
        print("Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed_data())
