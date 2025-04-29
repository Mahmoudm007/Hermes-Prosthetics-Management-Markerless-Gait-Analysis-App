from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from src.db.model.enum import AnalysisStatus
from src.utils import partial_model, to_camel


class GaitMetricBaseModel(BaseModel):
    """Base schema for gait metrics."""

    measurement_index: int = Field(
        ...,
        ge=0,
        example=0,
        description="Index of the measurement in the sequence (0-based).",
    )
    stance_time_left: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.5,
        description="Stance time for the left leg (seconds).",
    )
    stance_time_right: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.48,
        description="Stance time for the right leg (seconds).",
    )
    swing_time_left: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.3,
        description="Swing time for the left leg (seconds).",
    )
    swing_time_right: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.32,
        description="Swing time for the right leg (seconds).",
    )
    step_time_left: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.8,
        description="Step time for the left leg (seconds).",
    )
    step_time_right: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.81,
        description="Step time for the right leg (seconds).",
    )
    double_support_time_left: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.2,
        description="Double support time starting from left heel strike (seconds).",
    )
    double_support_time_right: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.21,
        description="Double support time starting from right heel strike (seconds).",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class GaitMetricResponseModel(GaitMetricBaseModel):
    """Schema for returning gait metric data in API responses."""

    id: int = Field(
        ..., example=1, description="Unique identifier for the gait metric."
    )
    gait_session_id: int = Field(
        ..., example=1, description="Reference to the associated session."
    )
    created_at: datetime = Field(
        ...,
        example="2025-04-24T10:30:00Z",
        description="Timestamp when the record was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2025-04-24T10:30:00Z",
        description="Timestamp when the record was last updated.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class GaitPlotDataBaseModel(BaseModel):
    """Base schema for gait plot data."""

    frame_number: int = Field(
        ..., ge=0, example=0, description="Frame number in the video (0-based)."
    )
    dist_left_filtered: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.3,
        description="Filtered distance for the left leg at this frame.",
    )
    dist_right_filtered: Optional[float] = Field(
        default=None,
        ge=0,
        example=0.29,
        description="Filtered distance for the right leg at this frame.",
    )
    is_peak_left: bool = Field(
        default=False,
        example=False,
        description="Indicates if this frame is a peak (heel strike) for the left leg.",
    )
    is_peak_right: bool = Field(
        default=False,
        example=False,
        description="Indicates if this frame is a peak (heel strike) for the right leg.",
    )
    is_minima_left: bool = Field(
        default=False,
        example=False,
        description="Indicates if this frame is a minima (toe-off) for the left leg.",
    )
    is_minima_right: bool = Field(
        default=False,
        example=False,
        description="Indicates if this frame is a minima (toe-off) for the right leg.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class GaitPlotDataResponseModel(GaitPlotDataBaseModel):
    """Schema for returning gait plot data in API responses."""

    id: int = Field(..., example=1, description="Unique identifier for the plot data.")
    gait_session_id: int = Field(
        ..., example=1, description="Reference to the associated session."
    )
    created_at: datetime = Field(
        ...,
        example="2025-04-24T10:30:00Z",
        description="Timestamp when the record was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2025-04-24T10:30:00Z",
        description="Timestamp when the record was last updated.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class GaitSessionPatientModel(BaseModel):
    """Schema for returning patient data in API responses."""

    id: int = Field(..., example=1024, description="Unique patient ID.")
    first_name: str = Field(
        ..., max_length=255, example="John", description="Patient's first name."
    )
    last_name: str = Field(
        ..., max_length=255, example="Doe", description="Patient's last name."
    )
    image_url: Optional[str] = Field(
        default=None,
        max_length=255,
        example="https://example.com/images/patient123.jpg",
        description="URL to the patient's profile image, if available.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class GaitSessionBaseModel(BaseModel):
    """Base schema for session."""

    patient_id: int = Field(
        ..., example=1, description="Reference to the associated patient."
    )
    video_url: str = Field(
        ...,
        example="https://example.com/videos/gait123.mp4",
        description="URL to the input video for gait analysis.",
    )
    session_date: Optional[date] = Field(
        default=None,
        ge=date(1900, 1, 1),
        le=date.today(),
        example="2025-04-24",
        description="Date when the session was conducted.",
    )
    title: Optional[str] = Field(
        default=None,
        example="Gait Analysis Session 1",
        description="Optional title for the session.",
    )
    description: Optional[str] = Field(
        default=None,
        example="Initial gait analysis for rehabilitation.",
        description="Optional description of the session.",
    )
    notes: Optional[str] = Field(
        default=None,
        example="Patient showed slight limp on right side.",
        description="Optional additional notes about the session.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class GaitSessionCreateModel(GaitSessionBaseModel):
    """Schema for creating a new session."""

    pass


@partial_model
class GaitSessionUpdateModel(BaseModel):
    """Schema for updating an existing session."""

    session_date: Optional[date] = Field(
        default=None,
        ge=date(1900, 1, 1),
        le=date.today(),
        example="2025-04-24",
        description="Date when the session was conducted.",
    )
    title: Optional[str] = Field(
        default=None,
        example="Gait Analysis Session 1",
        description="Optional title for the session.",
    )
    description: Optional[str] = Field(
        default=None,
        example="Initial gait analysis for rehabilitation.",
        description="Optional description of the session.",
    )
    notes: Optional[str] = Field(
        default=None,
        example="Patient showed slight limp on right side.",
        description="Optional additional notes about the session.",
    )
    recommendations: Optional[List[str]] = Field(
        default=None,
        example=["Consult physical therapist", "Increase step length"],
        description="Array of recommended actions based on the gait analysis.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class GaitSessionListResponseModel(GaitSessionBaseModel):
    """Schema for retrieving a list of sessions."""

    id: int = Field(..., example=1, description="Unique identifier for the session.")
    patient: Optional[GaitSessionPatientModel] = Field(
        default=None,
        description="Patient information associated with the session.",
    )
    analysis_status: AnalysisStatus = Field(
        ...,
        example=AnalysisStatus.Completed,
        description="Status of the gait analysis.",
    )
    created_at: datetime = Field(
        ...,
        example="2025-04-24T10:30:00Z",
        description="Timestamp when the record was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2025-04-24T10:30:00Z",
        description="Timestamp when the record was last updated.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class GaitSessionResponseModel(GaitSessionListResponseModel):
    """Schema for retrieving a session, including related entities."""

    annotated_video_url: Optional[str] = Field(
        default=None,
        example="https://example.com/videos/annotated_gait123.mp4",
        description="URL to the annotated output video (if available).",
    )
    frame_rate: Optional[float] = Field(
        default=None,
        ge=0,
        example=30.0,
        description="Frame rate of the video (calculated during analysis, optional).",
    )
    summarized_ai_analysis: Optional[str] = Field(
        default=None,
        example="Gait analysis indicates normal stride length but reduced swing time.",
        description="Full-text AI-generated analysis of the gait session.",
    )
    detailed_ai_analysis: Optional[str] = Field(
        default=None,
        example="Detailed analysis shows a consistent pattern of reduced swing time.",
        description="Detailed AI-generated analysis of the gait session.",
    )
    recommendations: List[str] = Field(
        default_factory=list,
        example=["Consult physical therapist", "Increase step length"],
        description="Array of recommended actions based on the gait analysis.",
    )
    possible_abnormalities: List[str] = Field(
        default_factory=list,
        example=["Reduced swing time", "Increased stance time"],
        description="Array of possible abnormalities detected during the gait analysis.",
    )
    recommended_exercises: List[str] = Field(
        default_factory=list,
        example=["Heel raises", "Toe taps"],
        description="Array of recommended exercises based on the gait analysis.",
    )
    long_term_risks: List[str] = Field(
        default_factory=list,
        example=["Increased risk of falls", "Potential joint issues"],
        description="Array of long-term risks associated with the gait analysis.",
    )
    gait_metrics: List[GaitMetricResponseModel] = Field(
        default_factory=list,
        description="List of gait metrics associated with the session.",
    )
    gait_plot_data: List[GaitPlotDataResponseModel] = Field(
        default_factory=list,
        description="List of per-frame plotting data associated with the session.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True
