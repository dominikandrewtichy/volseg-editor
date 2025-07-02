from enum import Enum

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.models.base_model import Base
from app.database.models.mixins.uuid_mixin import UuidMixin


class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"


class Role(Base, UuidMixin):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(default=None)

    users: Mapped[list["User"]] = relationship(back_populates="role")
