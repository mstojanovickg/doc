import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# Load .env from project root (two levels up from this file)
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

import ssl
from urllib.parse import urlparse, urlencode, urlunparse, parse_qs

_raw_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://robot:robotpass@localhost:5432/robotdb")

# asyncpg doesn't accept sslmode/channel_binding as query params — strip them
# and pass ssl context directly instead
_parsed = urlparse(_raw_url)
_params = parse_qs(_parsed.query)
_needs_ssl = _params.pop("sslmode", [None])[0] == "require"
_params.pop("channel_binding", None)
_clean_query = urlencode({k: v[0] for k, v in _params.items()})
DATABASE_URL = urlunparse(_parsed._replace(query=_clean_query))

if _needs_ssl:
    _ssl_ctx = ssl.create_default_context()
    _ssl_ctx.load_verify_locations(
        cafile="/etc/ssl/cert.pem"  # macOS system CA bundle
    )
    _connect_args = {"ssl": _ssl_ctx}
else:
    _connect_args = {}

engine = create_async_engine(DATABASE_URL, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
