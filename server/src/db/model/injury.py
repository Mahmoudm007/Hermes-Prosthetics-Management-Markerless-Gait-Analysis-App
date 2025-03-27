from sqlalchemy import TEXT, Column, DateTime
from sqlmodel import Relationship, SQLModel, Field
from datetime import date, datetime, timezone
from typing import Optional

from src.db.model.enum import Side
from src.db.model.patient import Patient
from src.utils import to_camel


class PatientInjury(SQLModel, table=True):
    """Represents an injury sustained by a patient."""

    __tablename__ = "patient_injury"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the injury.",
    )
    injury_type: str = Field(
        ..., description="Type of injury sustained by the patient."
    )
    injury_date: Optional[date] = Field(
        default=None, description="Date when the injury occurred (if known)."
    )
    injury_year: Optional[int] = Field(
        default=None,
        description="Year when the injury occurred (if exact date is unknown).",
    )
    treated: Optional[bool] = Field(
        default=None, description="Indicates whether the injury has been treated."
    )
    treatment_method: Optional[str] = Field(
        default=None, description="Method used to treat the injury, if applicable."
    )
    current_impact: Optional[str] = Field(
        default=None,
        description="Current impact of the injury on the patient's health or mobility.",
    )
    side: Side = Field(
        default=Side.Unknown, description="Which side of the body the injury affected."
    )
    details: Optional[str] = Field(
        default=None,
        description="Additional details about the injury, its treatment, etc.",
        sa_column=Column(TEXT, nullable=True),
    )

    patient_id: int = Field(
        foreign_key="patient.id", description="Reference to the associated patient."
    )
    patient: Patient = Relationship(back_populates="injuries")

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
        description="Timestamp when the record was created.",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc)
        ),
        description="Timestamp when the record was last updated.",
    )

    def __repr__(self):
        return (
            f"<PatientInjury(id={self.id}, injury_type='{self.injury_type}', "
            f"patient_id={self.patient_id}, treated={self.treated})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
