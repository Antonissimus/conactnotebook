import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, func


def _database_url() -> str:
    """Resolve SQLite URL for SQLAlchemy (async). Honors DATABASE_URL, then DATABASE_PATH."""
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    path = os.environ.get("DATABASE_PATH")
    if path:
        # Absolute path: sqlite+aiosqlite:////abs/path (four slashes after scheme)
        if path.startswith("/"):
            return "sqlite+aiosqlite:///" + path
        return f"sqlite+aiosqlite:///{path}"
    return "sqlite+aiosqlite:///contacts.db"


DATABASE_URL = _database_url()

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class ContactORM(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())

async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
