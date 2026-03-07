"""QuickTip — NBA GM Copilot backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db.pool import init_pool, close_pool
from backend.routers import chat, data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize resources on startup, clean up on shutdown."""
    await init_pool()
    yield
    await close_pool()


app = FastAPI(
    title="QuickTip — NBA GM Copilot",
    description="AI-powered NBA front office assistant",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(data.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "quicktip"}
