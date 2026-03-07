import os
import asyncpg
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

_pool: asyncpg.Pool | None = None


async def init_pool() -> asyncpg.Pool:
    """Initialize the asyncpg connection pool."""
    global _pool
    dsn = os.getenv("BDL_POSTGRES")
    if not dsn:
        raise RuntimeError("BDL_POSTGRES environment variable is not set")
    _pool = await asyncpg.create_pool(dsn=dsn, min_size=2, max_size=10)
    return _pool


async def get_pool() -> asyncpg.Pool:
    """Return the existing pool, or raise if not initialized."""
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call init_pool() first.")
    return _pool


async def close_pool() -> None:
    """Close the connection pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
