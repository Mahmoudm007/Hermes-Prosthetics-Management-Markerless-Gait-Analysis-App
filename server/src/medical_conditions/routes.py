from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.medical_conditions.service import MedicalConditionsService
from src.medical_conditions.schema import (
    FullPatientMedicalConditionCreateModel,
    PatientMedicalConditionResponseModel,
    PatientMedicalConditionUpdateModel,
)
from src.auth.dependencies import (
    AccessTokenBearer,
)

medical_conditions_router = APIRouter()
medical_conditions_service = MedicalConditionsService()

access_token_bearer = AccessTokenBearer()


@medical_conditions_router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=PatientMedicalConditionResponseModel,
)
async def create_medical_condition(
    medical_condition_data: FullPatientMedicalConditionCreateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientMedicalConditionResponseModel:
    return await medical_conditions_service.create_medical_condition(
        medical_condition_data, session
    )


@medical_conditions_router.get(
    "/{medical_condition_id}",
    status_code=status.HTTP_200_OK,
    response_model=PatientMedicalConditionResponseModel,
)
async def get_medical_condition(
    medical_condition_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientMedicalConditionResponseModel:
    return await medical_conditions_service.get_medical_condition_by_id(
        medical_condition_id, session
    )


@medical_conditions_router.patch(
    "/{medical_condition_id}",
    status_code=status.HTTP_200_OK,
    response_model=PatientMedicalConditionResponseModel,
)
async def update_medical_condition(
    medical_condition_id: int,
    medical_condition_data: PatientMedicalConditionUpdateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientMedicalConditionResponseModel:
    return await medical_conditions_service.update_medical_condition(
        medical_condition_id, medical_condition_data, session
    )


@medical_conditions_router.delete(
    "/{medical_condition_id}",
    status_code=status.HTTP_200_OK,
    response_model=PatientMedicalConditionResponseModel,
)
async def delete_medical_condition(
    medical_condition_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> PatientMedicalConditionResponseModel:
    return await medical_conditions_service.delete_medical_condition(
        medical_condition_id, session
    )
