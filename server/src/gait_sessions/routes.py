from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.utils import PaginatedResponse
from src.db.main import get_session
from src.gait_sessions.service import GaitSessionsService
from src.gait_sessions.schema import (
    GaitSessionCreateModel,
    GaitSessionListResponseModel,
    GaitSessionResponseModel,
    GaitSessionUpdateModel,
)
from src.auth.dependencies import (
    AccessTokenBearer,
)

gait_sessions_router = APIRouter()
gait_sessions_service = GaitSessionsService()

access_token_bearer = AccessTokenBearer()


@gait_sessions_router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=PaginatedResponse[GaitSessionListResponseModel],
)
async def get_all_gait_sessions(
    page: Optional[int] = Query(default=1, ge=1, description="Page number (1-based)"),
    limit: Optional[int] = Query(
        default=10, ge=1, le=100, description="Number of gait sessions per page"
    ),
    search: Optional[str] = Query(
        default=None,
        description="Search by gait session title or description or patient name",
    ),
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> list[GaitSessionListResponseModel]:
    return await gait_sessions_service.get_all_sessions(session, page, limit, search)


@gait_sessions_router.post(
    "", status_code=status.HTTP_201_CREATED, response_model=GaitSessionResponseModel
)
async def create_gait_session(
    gait_session_data: GaitSessionCreateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> GaitSessionResponseModel:
    return await gait_sessions_service.create_gait_session(gait_session_data, session)


@gait_sessions_router.get(
    "/{gait_session_id}",
    status_code=status.HTTP_200_OK,
    response_model=GaitSessionResponseModel,
)
async def get_gait_session(
    gait_session_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> GaitSessionResponseModel:
    return await gait_sessions_service.get_gait_session_by_id(gait_session_id, session)


@gait_sessions_router.patch(
    "/{gait_session_id}",
    status_code=status.HTTP_200_OK,
    response_model=GaitSessionResponseModel,
)
async def update_gait_session(
    gait_session_id: int,
    gait_session_data: GaitSessionUpdateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> GaitSessionResponseModel:
    return await gait_sessions_service.update_gait_session(
        gait_session_id, gait_session_data, session
    )


@gait_sessions_router.patch(
    "/{gait_session_id}/analyze",
    status_code=status.HTTP_200_OK,
    response_model=GaitSessionResponseModel,
)
async def analyze_gait_session(
    gait_session_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> GaitSessionResponseModel:
    return await gait_sessions_service.start_gait_analysis(gait_session_id, session)


@gait_sessions_router.delete(
    "/{gait_session_id}",
    status_code=status.HTTP_200_OK,
    response_model=GaitSessionResponseModel,
)
async def delete_gait_session(
    gait_session_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> GaitSessionResponseModel:
    return await gait_sessions_service.delete_gait_session(gait_session_id, session)
