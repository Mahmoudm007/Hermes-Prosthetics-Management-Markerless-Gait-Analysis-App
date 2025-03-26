from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.patients.service import PatientsService
from src.db.models import PatientMedicalCondition
from src.medical_conditions.schema import (
    FullPatientMedicalConditionCreateModel,
    PatientMedicalConditionUpdateModel,
)

patients_service = PatientsService()


class MedicalConditionsService:
    async def get_medical_condition_by_id(
        self, id: int, session: AsyncSession
    ) -> PatientMedicalCondition:
        statement = select(PatientMedicalCondition).where(
            PatientMedicalCondition.id == id
        )
        result = await session.exec(statement)
        medical_condition = result.first()

        if medical_condition is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical condition with this ID does not exist.",
            )

        return medical_condition

    async def create_medical_condition(
        self,
        medical_condition_data: FullPatientMedicalConditionCreateModel,
        session: AsyncSession,
    ) -> PatientMedicalCondition:
        await patients_service.get_patient_by_id(
            medical_condition_data.patient_id, session
        )
        new_medical_condition = PatientMedicalCondition(
            **medical_condition_data.model_dump(),
        )
        if medical_condition_data.diagnosis_date:
            new_medical_condition.diagnosis_year = (
                medical_condition_data.diagnosis_date.year
            )

        session.add(new_medical_condition)
        await session.commit()
        return new_medical_condition

    async def update_medical_condition(
        self,
        id: int,
        medical_condition_data: PatientMedicalConditionUpdateModel,
        session: AsyncSession,
    ) -> PatientMedicalCondition:
        medical_condition = await self.get_medical_condition_by_id(id, session)

        update_data = medical_condition_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(medical_condition, key, value)

        if medical_condition_data.diagnosis_date:
            medical_condition.diagnosis_year = (
                medical_condition_data.diagnosis_date.year
            )

        await session.commit()
        await session.refresh(medical_condition)
        return medical_condition

    async def delete_medical_condition(
        self, id: int, session: AsyncSession
    ) -> PatientMedicalCondition:
        medical_condition = await self.get_medical_condition_by_id(id, session)
        await session.delete(medical_condition)
        await session.commit()
        return medical_condition
