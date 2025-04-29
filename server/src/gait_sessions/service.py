from math import ceil
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.utils import PaginatedResponse
from src.patients.service import PatientsService
from src.db.models import GaitSession
from src.db.model.enum import AnalysisStatus
from src.gait_sessions.schema import (
    GaitSessionCreateModel,
    GaitSessionListResponseModel,
    GaitSessionUpdateModel,
)
from src.gait_sessions.celery_jobs import run_gait_analysis_task
from sqlalchemy import func
from sqlalchemy.orm import noload, joinedload

patients_service = PatientsService()


class GaitSessionsService:
    async def get_all_sessions(
        self,
        session: AsyncSession,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
    ) -> PaginatedResponse[GaitSessionListResponseModel]:
        """
        Get all gait sessions with pagination and optional search by title.
        Includes basic patient information (firstName, lastName, imageUrl).
        """
        # Create base query with join to Patient table
        base_query = (
            select(GaitSession)
            .options(
                noload(GaitSession.gait_metrics),
                noload(GaitSession.gait_plot_data),
            )
            .order_by(GaitSession.created_at.desc())
        )

        # Create count query
        total_sessions_query = select(func.count()).select_from(GaitSession)

        # Apply search filter if provided
        if search:
            where_clause = GaitSession.title.ilike(f"%{search}%")
            base_query = base_query.where(where_clause)
            total_sessions_query = total_sessions_query.where(where_clause)

        # Get total count
        total_sessions_result = await session.exec(total_sessions_query)
        total_sessions = total_sessions_result.first()
        total_pages = max(1, ceil(total_sessions / limit))

        # Apply pagination
        offset = (page - 1) * limit
        paginated_query = base_query.offset(offset).limit(limit)

        # Execute query
        result = await session.exec(paginated_query)
        sessions = result.all()

        return {
            "items": sessions,
            "page": page,
            "count": len(sessions),
            "total_pages": total_sessions,
            "has_next_page": page < total_pages,
        }

    async def get_gait_session_by_id(
        self, id: int, session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Get a gait session by ID, including patient information.
        """
        statement = select(GaitSession).where(GaitSession.id == id)
        result = await session.exec(statement)
        gait_session = result.first()

        if gait_session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gait session with this ID does not exist.",
            )

        return gait_session

    async def create_gait_session(
        self, gait_session_data: GaitSessionCreateModel, session: AsyncSession
    ) -> GaitSession:
        await patients_service.get_patient_by_id(gait_session_data.patient_id, session)
        new_gait_session = GaitSession(
            **gait_session_data.model_dump(),
        )

        session.add(new_gait_session)
        await session.commit()
        await session.refresh(new_gait_session)
        return new_gait_session

    async def update_gait_session(
        self, id: int, gait_session_data: GaitSessionUpdateModel, session: AsyncSession
    ) -> GaitSession:
        gait_session = await self.get_gait_session_by_id(id, session)

        update_data = gait_session_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(gait_session, key, value)

        await session.commit()
        await session.refresh(gait_session)
        return gait_session

    async def delete_gait_session(self, id: int, session: AsyncSession) -> GaitSession:
        gait_session = await self.get_gait_session_by_id(id, session)
        await session.delete(gait_session)
        await session.commit()
        return gait_session

    async def start_gait_analysis(
        self, session_id: int, session: AsyncSession
    ) -> GaitSession:
        """
        Start gait analysis for a session by setting status to Pending
        and triggering a background Celery task.
        """
        gait_session = await self.get_gait_session_by_id(session_id, session)

        if (
            gait_session.analysis_status != AnalysisStatus.Initial
            and gait_session.analysis_status != AnalysisStatus.Error
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gait analysis has already been started for this session.",
            )

        try:
            # Set status to Pending
            gait_session.analysis_status = AnalysisStatus.Pending
            await session.commit()
            await session.refresh(gait_session)

            # Start Celery task
            run_gait_analysis_task.delay(session_id)

            return gait_session

        except Exception as e:
            print(f"Error starting gait analysis: {str(e)}")
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to start gait analysis: {str(e)}",
            )
