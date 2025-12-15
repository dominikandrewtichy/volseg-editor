from datetime import datetime
from uuid import UUID

from sqlalchemy import TIMESTAMP, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.models.base_model import Base
from app.database.models.mixins import TimestampMixin, UuidMixin


class ApiKey(Base, UuidMixin, TimestampMixin):
    __tablename__ = "api_keys"

    key_hash: Mapped[str] = mapped_column(String, index=True, unique=True)
    prefix: Mapped[str] = mapped_column(String(10))

    name: Mapped[str] = mapped_column(String(255))

    expires_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    last_used_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    owner: Mapped["User"] = relationship("User", backref="api_keys")
