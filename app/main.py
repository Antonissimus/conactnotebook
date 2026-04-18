import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes_contacts import router as contacts_router
from app.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Contact Manager", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(contacts_router, prefix="/api")

if os.environ.get("SERVE_STATIC", "1") == "1":
    static_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), os.pardir, "static")
    )
    if os.path.isdir(static_dir):
        app.mount(
            "/",
            StaticFiles(directory=static_dir, html=True),
            name="static",
        )
