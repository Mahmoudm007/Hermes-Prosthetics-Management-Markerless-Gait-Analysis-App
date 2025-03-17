from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.patients.service import PatientsService
from src.db.models import Prosthetic
from src.prosthetics.schema import (
    FullProstheticCreateModel,
    ProstheticUpdateModel,
)

patients_service = PatientsService()


class ProstheticsService:
    async def get_prosthetic_by_id(self, id: int, session: AsyncSession) -> Prosthetic:
        statement = select(Prosthetic).where(Prosthetic.id == id)
        result = await session.exec(statement)
        prosthetic = result.first()

        if prosthetic is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prosthetic with this ID does not exist.",
            )

        return prosthetic

    async def create_prosthetic(
        self,
        prosthetic_data: FullProstheticCreateModel,
        session: AsyncSession,
    ) -> Prosthetic:
        await patients_service.get_patient_by_id(prosthetic_data.patient_id, session)
        new_prosthetic = Prosthetic(
            **prosthetic_data.model_dump(),
        )

        session.add(new_prosthetic)
        await session.commit()
        return new_prosthetic

    async def update_prosthetic(
        self,
        id: int,
        prosthetic_data: ProstheticUpdateModel,
        session: AsyncSession,
    ) -> Prosthetic:
        prosthetic = await self.get_prosthetic_by_id(id, session)

        update_data = prosthetic_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(prosthetic, key, value)

        await session.commit()
        await session.refresh(prosthetic)
        return prosthetic

    async def delete_prosthetic(self, id: int, session: AsyncSession) -> Prosthetic:
        prosthetic = await self.get_prosthetic_by_id(id, session)
        await session.delete(prosthetic)
        await session.commit()
        return prosthetic
