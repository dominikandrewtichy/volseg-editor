from uuid import UUID, uuid4

from sqlalchemy.orm import Mapped, declared_attr, mapped_column


class UuidMixin:
    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
