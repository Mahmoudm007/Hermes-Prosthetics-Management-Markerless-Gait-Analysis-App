from fastapi import FastAPI
from contextlib import asynccontextmanager

from src.db.main import init_db

version = "v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Server is starting...")
    await init_db()
    yield
    print("Server is stopping...")


app = FastAPI(
    title="Hermes",
    description="Hermes System API",
    version=version,
    lifespan=lifespan,
    openapi={
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                }
            }
        },
        "security": [{"BearerAuth": []}],
    },
)
