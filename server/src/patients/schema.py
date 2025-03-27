from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

from src.db.model.enum import Sex, LimbDominance
from src.medical_conditions.schema import (
    PatientMedicalConditionResponseModel,
    PatientMedicalConditionCreateModel,
)
from src.injuries.schema import (
    PatientInjuryResponseModel,
    PatientInjuryCreateModel,
)
from src.prosthetics.schema import (
    ProstheticResponseModel,
    ProstheticCreateModel,
)
from src.utils import partial_model, to_camel


class PatientBaseModel(BaseModel):
    """Base schema with shared attributes for Patient."""

    first_name: str = Field(
        ..., max_length=255, example="John", description="Patient's first name."
    )
    last_name: str = Field(
        ..., max_length=255, example="Doe", description="Patient's last name."
    )
    ssn: Optional[str] = Field(
        default=None,
        max_length=20,
        example="123-45-6789",
        description="Social Security Number (SSN) or National ID.",
    )
    email: Optional[EmailStr] = Field(
        default=None,
        example="john.doe@example.com",
        description="Unique email address of the patient.",
    )
    phone_number: Optional[str] = Field(
        default=None,
        max_length=20,
        example="+1-202-555-0198",
        description="Unique phone number of the patient.",
    )
    sex: Optional[Sex] = Field(
        default=Sex.Unknown,
        example=Sex.Male,
        description="Patient's sex (Male, Female, or Unknown).",
    )
    birth_date: Optional[date] = Field(
        default=None,
        ge=date(1900, 1, 1),
        le=date.today(),
        example="1985-06-15",
        description="Patient's date of birth, if known.",
    )
    age: Optional[int] = Field(
        default=None,
        ge=0,
        example=38,
        description="Patient's age in years (if birthdate is unknown).",
    )
    height: float = Field(
        ..., gt=0, example=175.5, description="Patient's height in centimeters."
    )
    weight: float = Field(
        ..., gt=0, example=72.3, description="Patient's weight in kilograms."
    )
    limb_dominance: Optional[LimbDominance] = Field(
        default=LimbDominance.Unknown,
        example=LimbDominance.Right,
        description="Patient's dominant limb (Left, Right, or Unknown).",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class PatientCreateModel(PatientBaseModel):
    """Schema for creating a new patient, including related entities."""

    medical_conditions: Optional[List[PatientMedicalConditionCreateModel]] = Field(
        default_factory=list,
        description="List of medical conditions associated with the patient.",
    )
    injuries: Optional[List[PatientInjuryCreateModel]] = Field(
        default_factory=list,
        description="List of injuries associated with the patient.",
    )
    prosthetics: Optional[List[ProstheticCreateModel]] = Field(
        default_factory=list,
        description="List of prosthetics associated with the patient.",
    )


@partial_model
class PatientUpdateModel(PatientBaseModel):
    """Schema for updating an existing patient record."""

    pass


class PatientListResponseModel(PatientBaseModel):
    """Schema for retrieving a list of patients."""

    id: int = Field(..., example=1024, description="Unique patient ID.")
    created_at: datetime = Field(
        ...,
        example="2023-04-15T10:30:00Z",
        description="Timestamp of when the patient was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2024-02-01T14:45:30Z",
        description="Timestamp of the last update to the patient record.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class PatientResponseModel(PatientListResponseModel):
    """Schema for retrieving a patient, including related entities."""

    medical_conditions: List[PatientMedicalConditionResponseModel] = Field(
        ...,
        description="List of medical conditions associated with theModel patient.",
    )
    injuries: List[PatientInjuryResponseModel] = Field(
        ..., description="List of injuries associated with the patient."
    )
    prosthetics: List[ProstheticResponseModel] = Field(
        ..., description="List of prosthetics associated with the patient."
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True
