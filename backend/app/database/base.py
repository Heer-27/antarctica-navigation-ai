from datetime import datetime, timezone
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy database models."""
    pass

class TimestampMixin:
    """Standard UTC timestamp tracking mixin."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
