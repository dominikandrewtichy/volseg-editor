from sqlalchemy import BigInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.core.settings.api_settings import get_api_settings
from app.database.models.base_model import Base
from app.database.models.mixins import TimestampMixin, UuidMixin


class User(Base, UuidMixin, TimestampMixin):
    __tablename__ = "users"

    sub: Mapped[str]
    name: Mapped[str | None]
    email: Mapped[str | None]

    storage_quota: Mapped[int] = mapped_column(
        BigInteger,
        default=get_api_settings().STORAGE_QUOTA,
    )
