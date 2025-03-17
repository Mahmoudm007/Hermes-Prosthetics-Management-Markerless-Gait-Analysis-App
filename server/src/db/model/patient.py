from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime, date
from typing import List, Optional

from src.db.model.enum import Sex, LimbDominance
from src.utils import to_camel


class Patient(SQLModel, table=True):
    """Database model representing a patient and their medical details."""

    __tablename__ = "patient"

    id: int = Field(
        default=None,
        primary_key=True,
        description="Unique identifier for the patient record.",
    )
    first_name: str = Field(..., max_length=255, description="Patient's first name.")
    last_name: str = Field(..., max_length=255, description="Patient's last name.")

    ssn: Optional[str] = Field(
        None,
        max_length=20,
        unique=True,
        description="Social Security Number (SSN) or national ID, if applicable.",
    )
    email: Optional[str] = Field(
        None, max_length=255, unique=True, description="Patient's unique email address."
    )
    phone_number: Optional[str] = Field(
        None, max_length=20, unique=True, description="Patient's unique phone number."
    )

    sex: Sex = Field(
        default=Sex.Unknown, description="Patient's sex (Male, Female, or Unknown)."
    )
    birth_date: Optional[date] = Field(None, description="Patient's date of birth.")
    age: Optional[int] = Field(
        None,
        ge=0,
        description="Patient's age in years. If birth date is available, it should be derived from it.",
    )

    height: float = Field(..., gt=0, description="Patient's height in centimeters.")
    weight: float = Field(..., gt=0, description="Patient's weight in kilograms.")

    limb_dominance: LimbDominance = Field(
        default=LimbDominance.Unknown,
        description="Patient's dominant limb (Left, Right, or Unknown).",
    )

    medical_conditions: List["PatientMedicalCondition"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    injuries: List["PatientInjury"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    prosthetics: List["Prosthetic"] = Relationship(
        back_populates="patient",
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp indicating when the patient record was created.",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of the most recent update to the patient record.",
    )

    def __repr__(self) -> str:
        """String representation of a Patient record for debugging and logging."""
        return (
            f"<Patient(id={self.id}, name={self.first_name} {self.last_name}, "
            f"sex={self.sex.value}, age={self.age}, created_at={self.created_at})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
