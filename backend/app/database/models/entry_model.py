from enum import Enum as PyEnum
from uuid import UUID

from sqlalchemy import BigInteger, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.models.base_model import Base
from app.database.models.mixins import TimestampMixin, UuidMixin


class EntryStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Entry(Base, UuidMixin, TimestampMixin):
    __tablename__ = "entries"

    name: Mapped[str] = mapped_column(String(255))
    title: Mapped[str | None] = mapped_column(String(255), default=None)
    description: Mapped[str | None] = mapped_column(String(2047), default=None)

    storage_key: Mapped[str] = mapped_column(unique=True)
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0)

    status: Mapped[EntryStatus] = mapped_column(Enum(EntryStatus), default=EntryStatus.PENDING)
    error_message: Mapped[str | None] = mapped_column()

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    owner: Mapped["User"] = relationship(  # type: ignore
        "User",
        foreign_keys=[owner_id],
    )
    link: Mapped["ShareLink"] = relationship(  # type: ignore
        back_populates="entry",
        cascade="all, delete-orphan",
        uselist=False,
    )
