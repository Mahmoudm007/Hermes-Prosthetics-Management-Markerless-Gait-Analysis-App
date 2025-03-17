from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.patients.service import PatientsService
from src.db.models import PatientInjury
from src.injuries.schema import FullPatientInjuryCreateModel, PatientInjuryUpdateModel

patients_service = PatientsService()


class InjuriesService:
    async def get_injury_by_id(self, id: int, session: AsyncSession) -> PatientInjury:
        statement = select(PatientInjury).where(PatientInjury.id == id)
        result = await session.exec(statement)
        injury = result.first()

        if injury is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Injury with this ID does not exist.",
            )

        return injury

    async def create_injury(
        self, injury_data: FullPatientInjuryCreateModel, session: AsyncSession
    ) -> PatientInjury:
        await patients_service.get_patient_by_id(injury_data.patient_id, session)
        new_injury = PatientInjury(
            **injury_data.model_dump(),
        )

        session.add(new_injury)
        await session.commit()
        return new_injury

    async def update_injury(
        self, id: int, injury_data: PatientInjuryUpdateModel, session: AsyncSession
    ) -> PatientInjury:
        injury = await self.get_injury_by_id(id, session)

        update_data = injury_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(injury, key, value)

        await session.commit()
        await session.refresh(injury)
        return injury

    async def delete_injury(self, id: int, session: AsyncSession) -> PatientInjury:
        injury = await self.get_injury_by_id(id, session)
        await session.delete(injury)
        await session.commit()
        return injury
