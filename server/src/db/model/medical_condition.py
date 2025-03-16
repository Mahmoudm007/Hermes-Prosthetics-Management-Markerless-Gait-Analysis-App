from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

from src.db.model.enum import Severity, TreatmentStatus
from src.utils import to_camel


class PatientMedicalCondition(SQLModel, table=True):
    """Represents a medical condition associated with a patient."""

    __tablename__ = "patient_medical_condition"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the medical condition.",
    )
    medical_condition_name: str = Field(
        description="Name of the diagnosed medical condition."
    )
    diagnosis_date: Optional[datetime] = Field(
        default=None, description="Date of diagnosis (if available)."
    )
    diagnosis_year: Optional[int] = Field(
        default=None, description="Year of diagnosis (if exact date is unknown)."
    )
    severity: Severity = Field(
        default=Severity.Unknown, description="Severity level of the medical condition."
    )
    treatment_status: TreatmentStatus = Field(
        default=TreatmentStatus.Unknown,
        description="Current treatment status of the condition.",
    )

    patient_id: int = Field(
        foreign_key="patient.id", description="Reference to the associated patient."
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the record was created.",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the record was last updated.",
    )

    def __repr__(self):
        return f"<PatientMedicalCondition(id={self.id}, name={self.medical_condition_name}, patient_id={self.patient_id})>"

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
