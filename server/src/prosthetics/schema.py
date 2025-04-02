from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, date

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
from src.utils import partial_model, to_camel


class ProstheticBaseModel(BaseModel):
    """Base schema for Prosthetic containing shared attributes."""

    weight: Optional[float] = Field(
        default=None,
        gt=0,
        example=3.2,
        description="Weight of the prosthetic in kilograms, to two decimal places.",
    )
    length: Optional[float] = Field(
        default=None,
        gt=0,
        example=45.5,
        description="Length of the prosthetic in centimeters, applicable to all types (e.g., full limb for Transfemoral, digit for Finger).",
    )
    usage_duration: Optional[int] = Field(
        default=None,
        ge=0,
        example=24,
        description="Total duration of use in months, if tracked.",
    )
    installation_date: Optional[date] = Field(
        default=None,
        example="2023-04-12",
        description="Date when the prosthetic was installed, if known.",
    )
    installation_year: Optional[int] = Field(
        default=None,
        ge=1900,
        example=2023,
        description="Year of installation if exact date is unknown. Mutually exclusive with installation_date.",
    )
    is_active: bool = Field(
        default=True,
        description="Indicates if the prosthetic is currently in use or has been retired.",
    )
    deactivation_date: Optional[date] = Field(
        default=None,
        description="Date when the prosthetic was deactivated, if applicable.",
    )
    deactivation_year: Optional[int] = Field(
        default=None,
        description="Year of deactivation if exact date is unknown. Mutually exclusive with deactivation_date.",
    )
    type: ProstheticType = Field(
        ...,
        example=ProstheticType.KneeDisarticulation,
        description="Type of prosthetic, defining its category and function.",
    )
    other_type: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom Hybrid Prosthesis",
        description="Custom prosthetic type if not in predefined categories.",
    )
    side: Side = Field(
        ...,
        example=Side.Left,
        description="Body side the prosthetic is designed for (Left, Right, Bilateral).",
    )
    alignment: Optional[Alignment] = Field(
        default=None,
        example=Alignment.Dynamic,
        description="Alignment type for prosthetic positioning, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation, Transhumeral, Transradial, Hand, ShoulderDisarticulation, partial Finger, Toe.",
    )
    other_alignment: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom Knee Alignment",
        description="Custom alignment if not in predefined categories.",
    )
    suspension_system: Optional[SuspensionSystem] = Field(
        default=None,
        example=SuspensionSystem.PinLock,
        description="Suspension system for attachment, applicable to types with a stump: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation, Transhumeral, Transradial, Hand, ShoulderDisarticulation.",
    )
    other_suspension_system: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Vacuum-assisted suspension",
        description="Custom suspension system if not in predefined types.",
    )
    foot_type: Optional[FootType] = Field(
        default=None,
        example=FootType.EnergyStoring,
        description="Type of prosthetic foot, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation.",
    )
    other_foot_type: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Carbon fiber foot",
        description="Custom foot type if not in predefined categories.",
    )
    knee_type: Optional[KneeType] = Field(
        default=None,
        example=KneeType.MicroprocessorControlled,
        description="Type of prosthetic knee, applicable to: Transfemoral, KneeDisarticulation, HipDisarticulation.",
    )
    other_knee_type: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Hydraulic knee joint",
        description="Custom knee type if not in predefined categories.",
    )
    pelvic_socket: Optional[PelvicSocket] = Field(
        default=None,
        example=PelvicSocket.Rigid,
        description="Type of pelvic socket, applicable to: HipDisarticulation.",
    )
    other_pelvic_socket: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom pelvic design",
        description="Custom pelvic socket type if not in predefined categories.",
    )
    finger_position: Optional[FingerPosition] = Field(
        default=None,
        example=FingerPosition.Thumb,
        description="Specific finger replaced, applicable to: Finger.",
    )
    toe_position: Optional[ToePosition] = Field(
        default=None,
        example=ToePosition.BigToe,
        description="Specific toe replaced, applicable to: Toe.",
    )
    material: MaterialType = Field(
        ...,
        example=MaterialType.CarbonFiber,
        description="Primary material of the prosthetic (e.g., Carbon Fiber, Titanium).",
    )
    other_material: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom polymer blend",
        description="Custom material if not in predefined categories.",
    )
    control_system: Optional[ControlSystem] = Field(
        default=None,
        example=ControlSystem.Mechanical,
        description="Control mechanism, applicable to types with active components: Transfemoral (knee), KneeDisarticulation (knee), HipDisarticulation (knee), Transhumeral (elbow/hand), Transradial (hand), Hand (fingers), ShoulderDisarticulation (arm/hand).",
    )
    other_control_system: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Neural interface control",
        description="Custom control system if not in predefined categories.",
    )
    activity_level: Optional[ActivityLevel] = Field(
        default=None,
        example=ActivityLevel.High,
        description="Intended activity level for the prosthetic, based on patient mobility needs.",
    )
    other_activity_level: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Athletic-grade prosthetic",
        description="Custom activity level if not in predefined categories.",
    )
    user_adaptation: Optional[UserAdaptation] = Field(
        default=None,
        example=UserAdaptation.Good,
        description="Patient's adaptation level to the prosthetic.",
    )
    socket_fit: Optional[SocketFit] = Field(
        default=None,
        example=SocketFit.Perfect,
        description="Quality of socket fit, applicable to types with a socket: Transtibial, Transfemoral, PartialFoot (if socketed), Syme, KneeDisarticulation, HipDisarticulation, Transhumeral, Transradial, Hand, ShoulderDisarticulation.",
    )
    stiffness: Optional[float] = Field(
        default=None,
        ge=0,
        example=200.0,
        description="Stiffness of the prosthetic component in appropriate units, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation (foot in N/m, knee in Nm/°); Transhumeral, ShoulderDisarticulation (elbow in Nm/° or arm structure in N/m).",
    )
    residual_limb_length: Optional[float] = Field(
        default=None,
        gt=0,
        example=15.0,
        description="Length of the residual limb in centimeters, applicable to types with a stump: Transtibial, Transfemoral, Syme, KneeDisarticulation, Transhumeral, Transradial, partial Finger, partial Toe.",
    )
    grip_strength: Optional[float] = Field(
        default=None,
        ge=0,
        example=50.0,
        description="Grip strength in newtons, applicable to: Transradial, Hand, Finger.",
    )
    range_of_motion_min: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
        example=-20.0,
        description="Minimum angle of range of motion in degrees, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation (foot: e.g., -20° plantarflexion); Transhumeral, ShoulderDisarticulation (elbow: e.g., 0° extension); Finger (finger: e.g., 0° extension).",
    )
    range_of_motion_max: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
        example=15.0,
        description="Maximum angle of range of motion in degrees, applicable to: Transtibial, Transfemoral, PartialFoot, Syme, KneeDisarticulation, HipDisarticulation (foot: e.g., 15° dorsiflexion); Transhumeral, ShoulderDisarticulation (elbow: e.g., 135° flexion); Finger (finger: e.g., 90° flexion).",
    )
    shock_absorption_energy: Optional[float] = Field(
        default=None,
        ge=0,
        example=10.0,
        description="Shock absorption energy in joules (J), applicable to: Transtibial, Transfemoral, Syme, KneeDisarticulation, HipDisarticulation.",
    )
    manufacturer: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Össur",
        description="Manufacturer or brand of the prosthetic (e.g., Össur, Ottobock).",
    )
    model: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Pro-Flex",
        description="Model name or number of the prosthetic (e.g., Pro-Flex, C-Leg).",
    )
    details: Optional[str] = Field(
        default=None,
        example="Custom prosthetic designed for high-impact sports.",
        description="Additional notes on the prosthetic (e.g., specs, installation details).",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class FullProstheticCreateModel(ProstheticBaseModel):
    """Schema for creating a new prosthetic record (requires patient_id)."""

    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )


class ProstheticCreateModel(ProstheticBaseModel):
    """Schema for creating a new prosthetic record (without patient_id)."""

    pass


@partial_model
class ProstheticUpdateModel(ProstheticBaseModel):
    """Schema for updating an existing prosthetic."""

    pass


class ProstheticResponseModel(ProstheticBaseModel):
    """Schema for returning a prosthetic record with additional metadata."""

    id: int = Field(
        ..., example=3491, description="Unique identifier for the prosthetic record."
    )
    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )
    created_at: datetime = Field(
        ...,
        example="2023-04-12T10:20:30Z",
        description="Timestamp of when the record was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2024-01-08T15:45:50Z",
        description="Timestamp of the most recent update to this record.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True
