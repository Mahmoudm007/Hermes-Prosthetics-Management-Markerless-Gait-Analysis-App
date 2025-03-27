from sqlalchemy import TEXT, Column, DateTime
from sqlmodel import Field, Relationship, SQLModel
from datetime import date, datetime, timezone
from typing import Optional

from src.db.model.enum import (
    FingerPosition,
    PelvicSocket,
    ProstheticType,
    Side,
    Alignment,
    SuspensionSystem,
    FootType,
    KneeType,
    MaterialType,
    ControlSystem,
    ActivityLevel,
    ToePosition,
    UserAdaptation,
    SocketFit,
)
from src.db.model.patient import Patient
from src.utils import to_camel


class Prosthetic(SQLModel, table=True):
    """Database model representing a patient's prosthetic details."""

    __tablename__ = "prosthetic"

    # --- Metadata ---
    id: int = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the prosthetic record.",
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
    installation_date: Optional[date] = Field(
        default=None,
        index=True,
        description="Date when the prosthetic was installed, if known.",
    )
    installation_year: Optional[int] = Field(
        default=None,
        description="Year of installation if exact date is unknown. Mutually exclusive with installation_date.",
    )
    usage_duration: Optional[int] = Field(
        default=None, ge=0, description="Total duration of use in months, if tracked."
    )

    # --- General Physical Properties ---
    type: ProstheticType = Field(
        ..., description="Type of prosthetic, defining its category and function."
    )
    other_type: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom prosthetic type if not in predefined categories.",
    )
    side: Side = Field(
        ...,
        description="Body side the prosthetic is designed for (Left, Right, Bilateral).",
    )
    weight: Optional[float] = Field(
        default=None,
        gt=0,
        description="Weight of the prosthetic in kilograms, to two decimal places.",
    )
    length: Optional[float] = Field(
        default=None,
        gt=0,
        description="Length of the prosthetic in centimeters, if applicable (e.g., full limb length for Transfemoral, digit length for Finger).",
    )
    material: MaterialType = Field(
        ...,
        description="Primary material of the prosthetic (e.g., Carbon Fiber, Titanium).",
    )
    other_material: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom material if not in predefined categories.",
    )
    manufacturer: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Manufacturer or brand of the prosthetic (e.g., Össur, Ottobock).",
    )
    model: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Model name or number of the prosthetic (e.g., Pro-Flex, C-Leg).",
    )

    # --- Fitting and Attachment ---
    residual_limb_length: Optional[float] = Field(
        default=None,
        gt=0,
        description="Length of the residual limb in centimeters, applicable to types with a stump: Transtibial, Transfemoral, Syme, KneeDisarticulation, Transhumeral, Transradial, partial Finger, partial Toe.",
    )
    alignment: Optional[Alignment] = Field(
        default=None,
        description="Alignment type for prosthetic positioning, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation, Transhumeral, Transradial, Hand, ShoulderDisarticulation, partial Finger, Toe.",
    )
    other_alignment: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom alignment if not in predefined categories.",
    )
    suspension_system: Optional[SuspensionSystem] = Field(
        default=None,
        description="Suspension system for attachment, applicable to types with a stump: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation, Transhumeral, Transradial, Hand, ShoulderDisarticulation.",
    )
    other_suspension_system: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom suspension system if not in predefined types.",
    )
    socket_fit: Optional[SocketFit] = Field(
        default=SocketFit.Unknown,
        description="Quality of socket fit, applicable to types with a socket: Transtibial, Transfemoral, PartialFoot (if socketed), Syme, KneeDisarticulation, HipDisarticulation, Transhumeral, Transradial, Hand, ShoulderDisarticulation.",
    )

    # --- Component-Specific Properties ---
    foot_type: Optional[FootType] = Field(
        default=None,
        description="Type of prosthetic foot, applicable to lower-limb types: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation.",
    )
    other_foot_type: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom foot type if not in predefined categories.",
    )
    knee_type: Optional[KneeType] = Field(
        default=None,
        description="Type of prosthetic knee, applicable to types with a knee: Transfemoral, KneeDisarticulation, HipDisarticulation.",
    )
    other_knee_type: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom knee type if not in predefined categories.",
    )
    pelvic_socket: Optional[PelvicSocket] = Field(
        default=None,
        description="Type of pelvic socket, applicable to HipDisarticulation.",
    )
    other_pelvic_socket: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom pelvic socket type if not in predefined categories.",
    )
    finger_position: Optional[FingerPosition] = Field(
        default=None, description="Specific finger replaced, applicable to Finger type."
    )
    toe_position: Optional[ToePosition] = Field(
        default=None, description="Specific toe replaced, applicable to Toe type."
    )

    # --- Functional Properties ---
    control_system: Optional[ControlSystem] = Field(
        default=None,
        description="Control mechanism, applicable to types with active components: Transfemoral (knee), KneeDisarticulation (knee), HipDisarticulation (knee), Transhumeral, Transradial, Hand, ShoulderDisarticulation.",
    )
    other_control_system: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom control system if not in predefined categories.",
    )
    grip_strength: Optional[float] = Field(
        default=None,
        ge=0,
        description="Grip strength in newtons, applicable to upper-limb types with hands: Transradial, Hand, Finger.",
    )
    range_of_motion_min: Optional[float] = Field(
        default=None,
        ge=-90,
        le=150,
        description="Minimum angle of range of motion in degrees, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation (foot: e.g., -20° plantarflexion); Transhumeral, ShoulderDisarticulation (elbow: e.g., 0° extension); Finger (finger: e.g., 0° extension).",
    )
    range_of_motion_max: Optional[float] = Field(
        default=None,
        ge=-90,
        le=150,
        description="Maximum angle of range of motion in degrees, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation (foot: e.g., 15° dorsiflexion); Transhumeral, ShoulderDisarticulation (elbow: e.g., 135° flexion); Finger (finger: e.g., 90° flexion).",
    )
    stiffness: Optional[float] = Field(
        default=None,
        ge=0,
        description="Stiffness of the prosthetic component in appropriate units, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation (foot in N/m, knee in Nm/°); Transhumeral, ShoulderDisarticulation (elbow in Nm/° or arm structure in N/m).",
    )
    shock_absorption_energy: Optional[float] = Field(
        default=None,
        ge=0,
        description="Energy absorbed by the prosthetic in joules (J), applicable to lower-limb types with impact: Transtibial, Transfemoral, Syme, KneeDisarticulation, HipDisarticulation.",
    )

    # --- Patient Experience ---
    activity_level: Optional[ActivityLevel] = Field(
        default=None,
        description="Intended activity level for the prosthetic, based on patient mobility needs.",
    )
    other_activity_level: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Custom activity level if not in predefined categories.",
    )
    user_adaptation: UserAdaptation = Field(
        default=UserAdaptation.Unknown,
        description="Patient's adaptation level to the prosthetic.",
    )

    # --- Additional Details ---
    details: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Additional notes on the prosthetic (e.g., specs, installation details).",
    )

    def __repr__(self) -> str:
        """String representation for debugging and logging."""
        return (
            f"<Prosthetic(id={self.id}, type={self.type.value}, side={self.side.value}, "
            f"weight={self.weight}, patient_id={self.patient_id}, created_at={self.created_at})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
