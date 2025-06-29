from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.models.base_model import Base
from app.database.models.mixins import TimestampMixin, UuidMixin


class VolsegEntry(Base, UuidMixin, TimestampMixin):
    __tablename__ = "volseg_entries"

    is_public: Mapped[bool] = mapped_column(default=False)
    cvsx_filepath: Mapped[str | None] = mapped_column(String(2083), default=None)

    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
    )

    user: Mapped["User"] = relationship(  # type: ignore
        back_populates="volseg_entries",
    )
    entries: Mapped[list["Entry"]] = relationship(  # type: ignore
        back_populates="volseg_entry",
    )
