from datetime import date
from math import ceil
from dateutil.relativedelta import relativedelta
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import noload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.models import Patient
from src.patients.schema import (
    PatientCreateModel,
    PatientListResponseModel,
    PatientUpdateModel,
)
from src.db.model.injury import PatientInjury
from src.db.model.prosthetic import Prosthetic
from src.db.model.medical_condition import PatientMedicalCondition

from src.utils import PaginatedResponse


class PatientsService:
    async def get_all_patients(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: str | None = None,
    ) -> PaginatedResponse[PatientListResponseModel]:
        base_query = (
            select(Patient)
            .options(
                noload(Patient.medical_conditions),
                noload(Patient.injuries),
                noload(Patient.prosthetics),
                noload(Patient.gait_sessions),
            )
            .order_by(Patient.first_name, Patient.last_name)
        )
        total_patients_query = select(func.count()).select_from(Patient)

        if search:
            full_name = Patient.first_name + " " + Patient.last_name
            where_clause = full_name.ilike(f"%{search}%")
            base_query = base_query.where(where_clause)
            total_patients_query = total_patients_query.where(where_clause)

        total_patients_result = await session.exec(total_patients_query)
        total_patients = total_patients_result.first()
        total_pages = max(1, ceil(total_patients / limit))

        offset = (page - 1) * limit
        paginated_query = base_query.offset(offset).limit(limit)

        result = await session.exec(paginated_query)
        patients = result.all()

        return {
            "items": patients,
            "page": page,
            "count": len(patients),
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
        }

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

        if patient_data.birth_date:
            new_patient.age = relativedelta(date.today(), patient_data.birth_date).years

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

        if patient_data.birth_date:
            patient.age = relativedelta(date.today(), patient_data.birth_date).years

        await session.commit()
        await session.refresh(patient)
        return patient

    async def delete_patient(self, id: int, session: AsyncSession) -> None:
        patient = await self.get_patient_by_id(id, session)

        medical_conditions_stmt = select(PatientMedicalCondition).where(
            PatientMedicalCondition.patient_id == id
        )
        medical_conditions_result = await session.exec(medical_conditions_stmt)
        medical_conditions = medical_conditions_result.all()
        for condition in medical_conditions:
            await session.delete(condition)

        injuries_stmt = select(PatientInjury).where(PatientInjury.patient_id == id)
        injuries_result = await session.exec(injuries_stmt)
        injuries = injuries_result.all()
        for injury in injuries:
            await session.delete(injury)

        prosthetics_stmt = select(Prosthetic).where(Prosthetic.patient_id == id)
        prosthetics_result = await session.exec(prosthetics_stmt)
        prosthetics = prosthetics_result.all()
        for prosthetic in prosthetics:
            await session.delete(prosthetic)

        await session.delete(patient)
        await session.commit()

        return None
