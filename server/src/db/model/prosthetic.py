from sqlalchemy import Column, DateTime
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime, timezone
from typing import Optional

from src.db.model.enum import (
    ProstheticType,
    Side,
    Alignment,
    SuspensionSystem,
    FootType,
    KneeType,
    MaterialType,
    ControlSystem,
    ActivityLevel,
    UserAdaptation,
    SocketFit,
    ProstheticStiffness,
)
from src.db.model.patient import Patient
from src.utils import to_camel


class Prosthetic(SQLModel, table=True):
    """Database model representing a patient's prosthetic details."""

    __tablename__ = "prosthetic"

    id: int = Field(
        default=None,
        primary_key=True,
        description="Unique identifier for the prosthetic record.",
    )
    weight: float = Field(
        ..., gt=0, description="Weight of the prosthetic in kilograms."
    )
    length: Optional[float] = Field(
        None,
        gt=0,
        description="Length of the prosthetic in centimeters, if applicable.",
    )
    flexibility: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Flexibility level of the prosthetic (0-100%), where higher values indicate more flexibility.",
    )
    usage_duration: Optional[int] = Field(
        None,
        ge=0,
        description="Total duration (in months) that the prosthetic has been in use.",
    )

    type: ProstheticType = Field(
        ...,
        description="Type of prosthetic used, categorized based on function and design.",
    )
    other_type: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom type of prosthetic if it does not fit into predefined categories.",
    )

    side: Side = Field(
        ...,
        description="Specifies whether the prosthetic is for the left or right side of the body.",
    )

    alignment: Alignment = Field(
        ..., description="Type of alignment used in the prosthetic fitting."
    )
    other_alignment: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom alignment specification if not covered by predefined categories.",
    )

    suspension_system: SuspensionSystem = Field(
        ...,
        description="Type of suspension system used to attach the prosthetic to the limb.",
    )
    other_suspension: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom suspension system if it does not match predefined types.",
    )

    foot_type: Optional[FootType] = Field(
        None, description="Type of prosthetic foot used, if applicable."
    )
    other_foot_type: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom foot type specification if the predefined categories do not apply.",
    )

    knee_type: Optional[KneeType] = Field(
        None, description="Type of prosthetic knee joint used, if applicable."
    )
    other_knee_type: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom knee type specification if not listed in predefined categories.",
    )

    material: MaterialType = Field(
        ...,
        description="Primary material composition of the prosthetic (e.g., Carbon Fiber, Titanium).",
    )
    other_material: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom material type if it does not fit predefined categories.",
    )

    control_system: Optional[ControlSystem] = Field(
        None,
        description="Control mechanism used in the prosthetic, such as myoelectric control.",
    )
    other_control_system: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom control system if the prosthetic control method is not predefined.",
    )

    activity_level: Optional[ActivityLevel] = Field(
        None,
        description="Activity level suitable for the prosthetic, based on patient mobility needs.",
    )
    other_activity_level: Optional[str] = Field(
        None,
        max_length=255,
        description="Custom activity level if it does not fit predefined mobility categories.",
    )

    user_adaptation: UserAdaptation = Field(
        default=UserAdaptation.Unknown,
        description="How well the patient has adapted to using the prosthetic.",
    )
    socket_fit: SocketFit = Field(
        default=SocketFit.Unknown,
        description="Quality of socket fit, which impacts comfort and usability.",
    )
    stiffness: ProstheticStiffness = Field(
        default=ProstheticStiffness.Unknown,
        description="Stiffness level of the prosthetic, which affects movement and stability.",
    )

    patient_id: int = Field(
        ...,
        foreign_key="patient.id",
        description="ID of the patient associated with this prosthetic.",
    )
    patient: Patient = Relationship(back_populates="prosthetics")

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

    def __repr__(self) -> str:
        """String representation of a Prosthetic record for debugging and logging."""
        return (
            f"<Prosthetic(id={self.id}, type={self.type.value}, side={self.side.value}, "
            f"patient_id={self.patient_id}, created_at={self.created_at})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
