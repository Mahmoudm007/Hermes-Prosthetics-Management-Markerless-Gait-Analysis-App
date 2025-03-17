from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

from src.db.model.enum import Side
from src.utils import make_optional, to_camel


class PatientInjuryBaseModel(BaseModel):
    """Base schema for patient injury."""

    injury_type: str = Field(
        ..., example="Fracture", description="Type of injury sustained by the patient."
    )
    injury_date: Optional[date] = Field(
        default=None,
        ge=date(1900, 1, 1),
        le=date.today(),
        example="2021-06-15",
        description="Date when the injury occurred (if known).",
    )
    injury_year: Optional[int] = Field(
        default=None,
        ge=1900,
        le=date.today().year,
        example=2021,
        description="Year when the injury occurred (if exact date is unknown).",
    )
    treated: Optional[bool] = Field(
        default=None,
        example=True,
        description="Indicates whether the injury has been treated.",
    )
    treatment_method: Optional[str] = Field(
        default=None,
        example="Surgery",
        description="Method used to treat the injury, if applicable.",
    )
    current_impact: Optional[str] = Field(
        default=None,
        example="Limited mobility",
        description="Current impact of the injury on the patient's health or mobility.",
    )
    side: Optional[Side] = Field(
        default=Side.Unknown,
        example=Side.Right,
        description="Which side of the body the injury affected.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class FullPatientInjuryCreateModel(PatientInjuryBaseModel):
    """Schema for creating a patient injury (requires patient_id)."""

    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )


class PatientInjuryCreateModel(PatientInjuryBaseModel):
    """Schema for creating a patient injury (without patient_id)."""

    pass


class PatientInjuryUpdateModel(make_optional(PatientInjuryBaseModel)):
    """Schema for updating an existing patient injury."""

    pass


class PatientInjuryResponseModel(PatientInjuryBaseModel):
    """Schema for returning patient injury data in API responses."""

    id: int = Field(..., description="Unique identifier for the injury.")
    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the record was created.",
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when the record was last updated.",
    )
