from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.models import Patient
from src.patients.schema import PatientCreateModel, PatientUpdateModel
from src.db.model.injury import PatientInjury
from src.db.model.prosthetic import Prosthetic
from src.db.model.medical_condition import PatientMedicalCondition


class PatientsService:
    async def get_patient_by_id(self, id: int, session: AsyncSession) -> Patient:
        statement = select(Patient).where(Patient.id == id)
        result = await session.exec(statement)
        patient = result.first()

        if patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient with this ID does not exist.",
            )

        return patient

    async def get_patient_by_email(
        self, email: str, session: AsyncSession
    ) -> Patient | None:
        statement = select(Patient).where(Patient.email == email)
        result = await session.exec(statement)
        return result.first()

    async def get_patient_by_ssn(
        self, ssn: str, session: AsyncSession
    ) -> Patient | None:
        statement = select(Patient).where(Patient.ssn == ssn)
        result = await session.exec(statement)
        return result.first()

    async def get_patient_by_phone_number(
        self, phone_number: str, session: AsyncSession
    ) -> Patient | None:
        statement = select(Patient).where(Patient.phone_number == phone_number)
        result = await session.exec(statement)
        return result.first()

    async def create_patient(
        self, patient_data: PatientCreateModel, session: AsyncSession
    ) -> Patient:
        if patient_data.email:
            email_exists = await self.get_patient_by_email(patient_data.email, session)
            if email_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Patient with this email already exists.",
                )

        if patient_data.ssn:
            ssn_exists = await self.get_patient_by_ssn(patient_data.ssn, session)
            if ssn_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Patient with this SSN already exists.",
                )

        if patient_data.phone_number:
            phone_number_exists = await self.get_patient_by_phone_number(
                patient_data.phone_number, session
            )
            if phone_number_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Patient with this phone number already exists.",
                )

        new_patient = Patient(
            **patient_data.model_dump(
                exclude={"medical_conditions", "injuries", "prosthetics"}
            ),
            medical_conditions=[
                PatientMedicalCondition(**condition_data.model_dump())
                for condition_data in patient_data.medical_conditions
            ],
            injuries=[
                PatientInjury(**injury_data.model_dump())
                for injury_data in patient_data.injuries
            ],
            prosthetics=[
                Prosthetic(**prosthetic_data.model_dump())
                for prosthetic_data in patient_data.prosthetics
            ],
        )

        session.add(new_patient)
        await session.commit()
        return new_patient

    async def update_patient(
        self, id: int, patient_data: PatientUpdateModel, session: AsyncSession
    ) -> Patient:
        patient = await self.get_patient_by_id(id, session)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        update_data = patient_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(patient, key, value)

        await session.commit()
        await session.refresh(patient)
        return patient
