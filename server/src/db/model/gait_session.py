from sqlalchemy import ARRAY, TEXT, Column, DateTime
from sqlmodel import Relationship, SQLModel, Field
from datetime import date, datetime, timezone
from typing import Optional, List
from src.db.model.enum import AnalysisStatus
from src.utils import to_camel
from src.db.model.patient import Patient


class GaitSession(SQLModel, table=True):
    """Represents a gait analysis session for a patient."""

    __tablename__ = "gait_session"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the session.",
    )
    patient_id: int = Field(
        foreign_key="patient.id",
        index=True,
        description="Reference to the associated patient.",
    )
    video_url: str = Field(description="URL to the input video for gait analysis.")
    annotated_video_url: Optional[str] = Field(
        default=None, description="URL to the annotated output video (if available)."
    )
    session_date: Optional[date] = Field(
        default=None, description="Date and time when the session was conducted."
    )
    title: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Optional title for the session.",
    )
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Optional description of the session.",
    )
    notes: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Optional additional notes about the session.",
    )
    frame_rate: Optional[float] = Field(
        default=None,
        description="Frame rate of the video (calculated during analysis, optional).",
    )
    detailed_ai_analysis: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Detailed AI-generated analysis of the gait session.",
    )
    summarized_ai_analysis: Optional[str] = Field(
        default=None,
        sa_column=Column(TEXT, nullable=True),
        description="Summarized AI-generated analysis of the gait session.",
    )
    recommendations: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(TEXT), nullable=False, default=[]),
        description="Array of recommended actions based on the gait analysis.",
    )
    possible_abnormalities: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(TEXT), nullable=False, default=[]),
        description="Array of possible abnormalities detected during the gait analysis.",
    )
    recommended_exercises: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(TEXT), nullable=False, default=[]),
        description="Array of recommended exercises based on the gait analysis.",
    )
    long_term_risks: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(TEXT), nullable=False, default=[]),
        description="Array of long-term risks associated with the gait analysis.",
    )
    analysis_status: AnalysisStatus = Field(
        default=AnalysisStatus.Initial, description="Status of the gait analysis."
    )
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

    patient: Patient = Relationship(
        back_populates="gait_sessions",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    gait_metrics: List["GaitMetric"] = Relationship(
        back_populates="gait_session",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    gait_plot_data: List["GaitPlotData"] = Relationship(
        back_populates="gait_session",
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    def __repr__(self):
        return (
            f"<Session(id={self.id}, patient_id={self.patient_id}, "
            f"video_url='{self.video_url}', session_date={self.session_date})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class GaitMetric(SQLModel, table=True):
    """Represents a set of gait metrics for a specific measurement in a session."""

    __tablename__ = "gait_metrics"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the gait metric.",
    )
    gait_session_id: int = Field(
        foreign_key="gait_session.id",
        index=True,
        description="Reference to the associated session.",
    )
    measurement_index: int = Field(
        description="Index of the measurement in the sequence (0-based).", index=True
    )
    stance_time_left: Optional[float] = Field(
        default=None, description="Stance time for the left leg (seconds)."
    )
    stance_time_right: Optional[float] = Field(
        default=None, description="Stance time for the right leg (seconds)."
    )
    swing_time_left: Optional[float] = Field(
        default=None, description="Swing time for the left leg (seconds)."
    )
    swing_time_right: Optional[float] = Field(
        default=None, description="Swing time for the right leg (seconds)."
    )
    step_time_left: Optional[float] = Field(
        default=None, description="Step time for the left leg (seconds)."
    )
    step_time_right: Optional[float] = Field(
        default=None, description="Step time for the right leg (seconds)."
    )
    double_support_time_left: Optional[float] = Field(
        default=None,
        description="Double support time starting from left heel strike (seconds).",
    )
    double_support_time_right: Optional[float] = Field(
        default=None,
        description="Double support time starting from right heel strike (seconds).",
    )
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

    gait_session: GaitSession = Relationship(back_populates="gait_metrics")

    def __repr__(self):
        return (
            f"<GaitMetric(id={self.id}, gait_session_id={self.gait_session_id}, "
            f"measurement_index={self.measurement_index})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class GaitPlotData(SQLModel, table=True):
    """Represents per-frame plotting data for a gait analysis session."""

    __tablename__ = "gait_plot_data"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the plot data.",
    )
    gait_session_id: int = Field(
        foreign_key="gait_session.id",
        index=True,
        description="Reference to the associated session.",
    )
    frame_number: int = Field(
        description="Frame number in the video (0-based).", index=True
    )
    dist_left_filtered: Optional[float] = Field(
        default=None, description="Filtered distance for the left leg at this frame."
    )
    dist_right_filtered: Optional[float] = Field(
        default=None, description="Filtered distance for the right leg at this frame."
    )
    is_peak_left: bool = Field(
        default=False,
        description="Indicates if this frame is a peak (heel strike) for the left leg.",
    )
    is_peak_right: bool = Field(
        default=False,
        description="Indicates if this frame is a peak (heel strike) for the right leg.",
    )
    is_minima_left: bool = Field(
        default=False,
        description="Indicates if this frame is a minima (toe-off) for the left leg.",
    )
    is_minima_right: bool = Field(
        default=False,
        description="Indicates if this frame is a minima (toe-off) for the right leg.",
    )
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

    gait_session: GaitSession = Relationship(back_populates="gait_plot_data")

    def __repr__(self):
        return (
            f"<GaitPlotData(id={self.id}, gait_session_id={self.gait_session_id}, "
            f"frame_number={self.frame_number})>"
        )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
