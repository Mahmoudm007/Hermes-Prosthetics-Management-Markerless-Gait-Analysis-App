from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

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
from src.utils import make_optional, to_camel


class ProstheticBaseModel(BaseModel):
    """Base schema for Prosthetic containing shared attributes."""

    weight: float = Field(
        ...,
        gt=0,
        example=3.2,
        description="Weight of the prosthetic in kilograms.",
    )
    length: Optional[float] = Field(
        default=None,
        gt=0,
        example=45.5,
        description="Length of the prosthetic in centimeters.",
    )
    flexibility: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        example=75.0,
        description="Flexibility of the prosthetic as a percentage (0-100).",
    )
    usage_duration: Optional[int] = Field(
        default=None,
        ge=0,
        example=24,
        description="Duration of usage in months.",
    )
    type: ProstheticType = Field(
        ...,
        example=ProstheticType.KneeDisarticulation,
        description="Type of prosthetic (e.g., upper limb, lower limb).",
    )
    other_type: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom Hybrid Prosthesis",
        description="Additional details if type is 'Other'.",
    )
    side: Side = Field(
        ...,
        example=Side.Left,
        description="Side of the body where the prosthetic is used.",
    )

    alignment: Alignment = Field(
        ...,
        example=Alignment.Dynamic,
        description="Alignment of the prosthetic (e.g., static, dynamic).",
    )
    other_alignment: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom Knee Alignment",
        description="Additional details if alignment is 'Other'.",
    )
    suspension_system: SuspensionSystem = Field(
        ...,
        example=SuspensionSystem.PinLock,
        description="Type of suspension system used.",
    )
    other_suspension: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Vacuum-assisted suspension",
        description="Additional details if suspension system is 'Other'.",
    )
    foot_type: Optional[FootType] = Field(
        default=None,
        example=FootType.EnergyStoring,
        description="Type of foot used in the prosthetic.",
    )
    other_foot_type: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Carbon fiber foot",
        description="Additional details if foot type is 'Other'.",
    )
    knee_type: Optional[KneeType] = Field(
        default=None,
        example=KneeType.MicroprocessorControlled,
        description="Type of knee used in the prosthetic, if applicable.",
    )
    other_knee_type: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Hydraulic knee joint",
        description="Additional details if knee type is 'Other'.",
    )
    material: MaterialType = Field(
        ...,
        example=MaterialType.CarbonFiber,
        description="Material used to construct the prosthetic.",
    )
    other_material: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Custom polymer blend",
        description="Additional details if material type is 'Other'.",
    )
    control_system: Optional[ControlSystem] = Field(
        default=None,
        example=ControlSystem.Mechanical,
        description="Control system used in the prosthetic, if applicable.",
    )
    other_control_system: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Neural interface control",
        description="Additional details if control system is 'Other'.",
    )
    activity_level: Optional[ActivityLevel] = Field(
        default=None,
        example=ActivityLevel.High,
        description="Patient's activity level that the prosthetic supports.",
    )
    other_activity_level: Optional[str] = Field(
        default=None,
        max_length=255,
        example="Athletic-grade prosthetic",
        description="Additional details if activity level is 'Other'.",
    )

    user_adaptation: Optional[UserAdaptation] = Field(
        default=UserAdaptation.Unknown,
        example=UserAdaptation.Good,
        description="Patient's adaptation to using the prosthetic.",
    )
    socket_fit: Optional[SocketFit] = Field(
        default=SocketFit.Unknown,
        example=SocketFit.Perfect,
        description="Fit of the prosthetic socket.",
    )
    stiffness: Optional[ProstheticStiffness] = Field(
        default=ProstheticStiffness.Unknown,
        example=ProstheticStiffness.Medium,
        description="Stiffness of the prosthetic.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class FullProstheticCreateModel(ProstheticBaseModel):
    """Schema for creating a new prosthetic record (requires patient_id)."""

    patient_id: int = Field(
        ...,
        example=1,
        description="Reference to the associated patient.",
    )


class ProstheticCreateModel(ProstheticBaseModel):
    """Schema for creating a new prosthetic record (without patient_id)."""

    pass


class ProstheticUpdateModel(make_optional(ProstheticBaseModel)):
    """Schema for updating an existing prosthetic."""

    pass


class ProstheticResponseModel(ProstheticBaseModel):
    """Schema for returning a prosthetic record with additional metadata."""

    id: int = Field(
        ...,
        example=3491,
        description="Unique identifier for the prosthetic record.",
    )
    patient_id: int = Field(
        ...,
        example=1,
        description="Reference to the associated patient.",
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
