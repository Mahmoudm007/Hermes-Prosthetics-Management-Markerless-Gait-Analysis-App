from celery import Celery
import asyncio
import billiard
import pandas as pd
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.db.models import GaitSession, GaitMetric, GaitPlotData, AnalysisStatus
from src.gait_sessions.gait_analysis_pipeline import (
    GaitAnalysisOutput,
    GaitAnalysisPipeline,
)
from src.config import Config

# Initialize Celery
celery_app = Celery(
    "gait_analysis_tasks",
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND,
)

pipeline = None


async def get_gait_session_by_id(session_id: int, session: AsyncSession):
    """Get a gait session by ID."""
    result = await session.exec(select(GaitSession).where(GaitSession.id == session_id))
    gait_session = result.first()
    if not gait_session:
        raise ValueError(f"Gait session with ID {session_id} not found")
    return gait_session


@celery_app.task
def run_gait_analysis_task(session_id: int):
    """
    Celery task to run gait analysis in the background.

    Args:
        session_id (int): The ID of the gait session to analyze

    Returns:
        dict: Status information about the completed analysis
    """
    # Create event loop for async operations
    loop = asyncio.get_event_loop()
    try:
        global pipeline
        if pipeline is None:
            pipeline = GaitAnalysisPipeline()
        return loop.run_until_complete(_run_analysis(session_id, pipeline))
    except Exception as e:
        print(f"Critical error in gait analysis task: {str(e)}")
        loop.run_until_complete(_handle_analysis_error(session_id, str(e)))
        raise e
    except billiard.exceptions.WorkerLostError as wle:
        print(f"Worker lost error in gait analysis task: {str(wle)}")
        loop.run_until_complete(_handle_analysis_error(session_id, str(wle)))
        raise


async def _run_analysis(session_id: int, pipeline: GaitAnalysisPipeline):
    """
    Run the gait analysis asynchronously.

    Args:
        session_id (int): The ID of the gait session to analyze

    Returns:
        dict: Status information about the completed analysis
    """
    async for session in get_session():
        try:
            gait_session = await get_gait_session_by_id(session_id, session)

            gait_session.analysis_status = AnalysisStatus.InProgress
            await session.commit()
            await session.refresh(gait_session)

            # Run analysis pipeline
            (
                annotated_video_url,
                df,
                frame_rate,
                dist_left_filtered,
                dist_right_filtered,
                peaks_left,
                peaks_right,
                minima_left,
                minima_right,
                ai_analysis,
            ) = await pipeline.run_analysis(gait_session, gait_session.video_url)

            # Validate DataFrame
            if df.empty:
                raise ValueError("No gait metrics generated")

            # Update session with results
            gait_session.annotated_video_url = annotated_video_url
            gait_session.frame_rate = frame_rate
            gait_session.detailed_ai_analysis = ai_analysis.detailed_analysis
            gait_session.summarized_ai_analysis = ai_analysis.summary
            gait_session.recommendations = ai_analysis.recommendations
            gait_session.possible_abnormalities = ai_analysis.possible_abnormalities
            gait_session.recommended_exercises = ai_analysis.recommended_exercises
            gait_session.long_term_risks = ai_analysis.long_term_risks
            gait_session.analysis_status = AnalysisStatus.Completed

            # Store gait metrics
            for idx, row in df.iterrows():
                gait_metric = GaitMetric(
                    gait_session_id=session_id,
                    measurement_index=idx,
                    stance_time_left=(
                        float(row["Stance Time Left"])
                        if pd.notnull(row["Stance Time Left"])
                        else None
                    ),
                    stance_time_right=(
                        float(row["Stance Time Right"])
                        if pd.notnull(row["Stance Time Right"])
                        else None
                    ),
                    swing_time_left=(
                        float(row["Swing Time Left"])
                        if pd.notnull(row["Swing Time Left"])
                        else None
                    ),
                    swing_time_right=(
                        float(row["Swing Time Right"])
                        if pd.notnull(row["Swing Time Right"])
                        else None
                    ),
                    step_time_left=(
                        float(row["Step Time Left"])
                        if pd.notnull(row["Step Time Left"])
                        else None
                    ),
                    step_time_right=(
                        float(row["Step Time Right"])
                        if pd.notnull(row["Step Time Right"])
                        else None
                    ),
                    double_support_time_left=(
                        float(row["Double Support Times Left"])
                        if pd.notnull(row["Double Support Times Left"])
                        else None
                    ),
                    double_support_time_right=(
                        float(row["Double Support Times Right"])
                        if pd.notnull(row["Double Support Times Right"])
                        else None
                    ),
                )
                session.add(gait_metric)
            await session.flush()

            # Store gait plot data
            plot_df = pd.DataFrame(
                {
                    "frame_number": range(len(dist_left_filtered)),
                    "dist_left_filtered": dist_left_filtered,
                    "dist_right_filtered": dist_right_filtered,
                    "is_peak_left": [
                        i in peaks_left for i in range(len(dist_left_filtered))
                    ],
                    "is_peak_right": [
                        i in peaks_right for i in range(len(dist_right_filtered))
                    ],
                    "is_minima_left": [
                        i in minima_left for i in range(len(dist_left_filtered))
                    ],
                    "is_minima_right": [
                        i in minima_right for i in range(len(dist_right_filtered))
                    ],
                }
            )

            # Validate plot_df
            if plot_df.empty:
                raise ValueError("No gait plot data generated")
            if (
                plot_df["dist_left_filtered"].isna().any()
                or plot_df["dist_right_filtered"].isna().any()
            ):
                raise ValueError("NaN values detected in gait plot distances")

            # Use batch insertion for better performance with large datasets
            plot_data_batch = []
            for _, row in plot_df.iterrows():
                plot_data = GaitPlotData(
                    gait_session_id=session_id,
                    frame_number=int(row["frame_number"]),
                    dist_left_filtered=(
                        float(row["dist_left_filtered"])
                        if pd.notnull(row["dist_left_filtered"])
                        else None
                    ),
                    dist_right_filtered=(
                        float(row["dist_right_filtered"])
                        if pd.notnull(row["dist_right_filtered"])
                        else None
                    ),
                    is_peak_left=bool(row["is_peak_left"]),
                    is_peak_right=bool(row["is_peak_right"]),
                    is_minima_left=bool(row["is_minima_left"]),
                    is_minima_right=bool(row["is_minima_right"]),
                )
                plot_data_batch.append(plot_data)

                # Add in batches of 1000 to avoid memory issues
                if len(plot_data_batch) >= 1000:
                    session.add_all(plot_data_batch)
                    await session.flush()
                    plot_data_batch = []

            # Add any remaining items
            if plot_data_batch:
                session.add_all(plot_data_batch)
                await session.flush()

            # Commit all changes
            await session.commit()
            await session.refresh(gait_session)

            return {
                "status": "completed",
                "session_id": session_id,
                "metrics_count": len(df),
                "plot_points_count": len(plot_df),
            }

        except Exception as e:
            print(f"Error during gait analysis: {str(e)}")
            await session.rollback()
            # Update status to Error
            try:
                gait_session = await get_gait_session_by_id(session_id, session)
                gait_session.analysis_status = AnalysisStatus.Error
                await session.commit()
                print(f"Gait analysis for session {session_id} failed: {str(e)}")
            except Exception as db_error:
                print(f"Failed to update session status: {str(db_error)}")

            raise ValueError(f"Gait analysis failed: {str(e)}")


async def _handle_analysis_error(session_id: int, error_message: str):
    """
    Handle errors in the analysis by updating the session status.

    Args:
        session_id (int): The ID of the gait session
        error_message (str): The error message
    """
    async for session in get_session():
        try:
            gait_session = await get_gait_session_by_id(session_id, session)
            gait_session.analysis_status = AnalysisStatus.Error
            await session.commit()
            print(f"Session {session_id} status set to Error due to: {error_message}")
        except Exception as e:
            print(f"Failed to update session status to Error: {str(e)}")
