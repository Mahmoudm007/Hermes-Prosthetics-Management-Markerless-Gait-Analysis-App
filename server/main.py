import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager

from src.db.main import init_db
from src.auth.routes import users_router
from src.patients.routes import patients_router
from src.injuries.routes import injuries_router
from src.medical_conditions.routes import medical_conditions_router
from src.prosthetics.routes import prosthetics_router
from src.gait_sessions.routes import gait_sessions_router

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
    swagger_ui_parameters={"persistAuthorization": True},
)

app.include_router(users_router, prefix=f"/api/{version}/auth", tags=["Auth"])
app.include_router(
    patients_router, prefix=f"/api/{version}/patients", tags=["Patients"]
)
app.include_router(
    injuries_router, prefix=f"/api/{version}/injuries", tags=["Injuries"]
)
app.include_router(
    medical_conditions_router,
    prefix=f"/api/{version}/medical-conditions",
    tags=["Medical Conditions"],
)
app.include_router(
    prosthetics_router, prefix=f"/api/{version}/prosthetics", tags=["Prosthetics"]
)
app.include_router(
    gait_sessions_router, prefix=f"/api/{version}/gait-sessions", tags=["Gait Sessions"]
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
