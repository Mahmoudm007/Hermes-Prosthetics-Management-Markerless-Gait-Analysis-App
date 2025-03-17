from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.injuries.service import InjuriesService
from src.injuries.schema import (
    FullPatientInjuryCreateModel,
    PatientInjuryResponseModel,
    PatientInjuryUpdateModel,
)
from src.auth.dependencies import (
    AccessTokenBearer,
)

injuries_router = APIRouter()
injuries_service = InjuriesService()

access_token_bearer = AccessTokenBearer()


@injuries_router.post(
    "", status_code=status.HTTP_201_CREATED, response_model=PatientInjuryResponseModel
)
async def create_injury(
    injury_data: FullPatientInjuryCreateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientInjuryResponseModel:
    return await injuries_service.create_injury(injury_data, session)


@injuries_router.get(
    "/{injury_id}",
    status_code=status.HTTP_200_OK,
    response_model=PatientInjuryResponseModel,
)
async def get_injury(
    injury_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientInjuryResponseModel:
    return await injuries_service.get_injury_by_id(injury_id, session)


@injuries_router.patch(
    "/{injury_id}",
    status_code=status.HTTP_200_OK,
    response_model=PatientInjuryResponseModel,
)
async def update_injury(
    injury_id: int,
    injury_data: PatientInjuryUpdateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientInjuryResponseModel:
    return await injuries_service.update_injury(injury_id, injury_data, session)


@injuries_router.delete(
    "/{injury_id}",
    status_code=status.HTTP_200_OK,
    response_model=PatientInjuryResponseModel,
)
async def delete_injury(
    injury_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientInjuryResponseModel:
    return await injuries_service.delete_injury(injury_id, session)
