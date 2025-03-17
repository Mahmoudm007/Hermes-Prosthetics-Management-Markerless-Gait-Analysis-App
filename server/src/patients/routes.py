from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.patients.service import PatientsService
from src.patients.schema import (
    PatientCreateModel,
    PatientResponseModel,
    PatientUpdateModel,
)
from src.auth.dependencies import (
    AccessTokenBearer,
)

patients_router = APIRouter()
patients_service = PatientsService()

access_token_bearer = AccessTokenBearer()


@patients_router.post(
    "", status_code=status.HTTP_201_CREATED, response_model=PatientResponseModel
)
async def create_patient(
    patient_data: PatientCreateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientResponseModel:
    return await patients_service.create_patient(patient_data, session)


@patients_router.get(
    "/{patient_id}", status_code=status.HTTP_200_OK, response_model=PatientResponseModel
)
async def get_patient(
    patient_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientResponseModel:
    return await patients_service.get_patient_by_id(patient_id, session)


@patients_router.patch(
    "/{patient_id}", status_code=status.HTTP_200_OK, response_model=PatientResponseModel
)
async def update_patient(
    patient_id: int,
    patient_data: PatientUpdateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientResponseModel:
    return await patients_service.update_patient(patient_id, patient_data, session)
