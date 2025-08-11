from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.models.base_model import Base
from app.database.models.mixins import TimestampMixin, UuidMixin


class View(Base, UuidMixin, TimestampMixin):
    __tablename__ = "views"

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(default=None)
    snapshot_url: Mapped[str | None] = mapped_column(String(2083), default=None)
    thumbnail_url: Mapped[str | None] = mapped_column(String(2083), default=None)
    is_thumbnail: Mapped[bool] = mapped_column(default=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    entry_id: Mapped[UUID] = mapped_column(ForeignKey("entries.id", ondelete="CASCADE"))

    entry: Mapped["Entry"] = relationship(back_populates="views")  # type: ignore

    def has_owner(self, user_id: UUID) -> bool:
        return self.entry.user_id == user_id
