from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

from src.db.model.enum import Severity, TreatmentStatus
from src.utils import partial_model, to_camel


class PatientMedicalConditionBaseModel(BaseModel):
    """Base schema for PatientMedicalCondition containing shared attributes."""

    medical_condition_name: str = Field(
        ...,
        max_length=255,
        example="Osteoarthritis",
        description="Name of the medical condition diagnosed in the patient.",
    )
    diagnosis_date: Optional[date] = Field(
        default=None,
        ge=date(1900, 1, 1),
        le=date.today(),
        example="2018-07-22",
        description="Exact date when the condition was diagnosed, if available.",
    )
    diagnosis_year: Optional[int] = Field(
        default=None,
        ge=1900,
        le=date.today().year,
        example=2018,
        description="Year when the condition was diagnosed if the exact date is unknown.",
    )
    severity: Optional[Severity] = Field(
        default=Severity.Unknown,
        example=Severity.Severe,
        description="Severity level of the condition, impacting treatment decisions.",
    )
    treatment_status: Optional[TreatmentStatus] = Field(
        default=TreatmentStatus.Unknown,
        example=TreatmentStatus.UnderControl,
        description="Current treatment status, which determines ongoing medical interventions.",
    )
    details: Optional[str] = Field(
        default=None,
        example="Patient experiences chronic pain and stiffness in joints.",
        description="Additional details about the medical condition, its severity, symptoms, treatment, etc.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class FullPatientMedicalConditionCreateModel(PatientMedicalConditionBaseModel):
    """Schema for creating a patient medical condition (requires patient_id)."""

    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )


class PatientMedicalConditionCreateModel(PatientMedicalConditionBaseModel):
    """Schema for creating a patient medical condition (without patient_id)."""

    pass
    patient_id: None = Field(None)


@partial_model
class PatientMedicalConditionUpdateModel(PatientMedicalConditionCreateModel):
    """Schema for updating an existing patient medical condition."""

    pass


class PatientMedicalConditionResponseModel(PatientMedicalConditionBaseModel):
    """Schema for returning a patient medical condition with additional metadata."""

    id: int = Field(
        ...,
        example=1287,
        description="Unique identifier for the medical condition record.",
    )
    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )
    created_at: datetime = Field(
        ...,
        example="2023-02-05T14:25:36Z",
        description="Timestamp of when the record was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2023-11-12T09:17:45Z",
        description="Timestamp of the most recent update to this record.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True  # Enables ORM conversion
