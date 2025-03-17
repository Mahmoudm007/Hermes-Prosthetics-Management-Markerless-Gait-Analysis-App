from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.prosthetics.service import ProstheticsService
from src.prosthetics.schema import (
    FullProstheticCreateModel,
    ProstheticResponseModel,
    ProstheticUpdateModel,
)
from src.auth.dependencies import (
    AccessTokenBearer,
)

prosthetics_router = APIRouter()
prosthetics_service = ProstheticsService()

access_token_bearer = AccessTokenBearer()


@prosthetics_router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ProstheticResponseModel,
)
async def create_prosthetic(
    prosthetic_data: FullProstheticCreateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> ProstheticResponseModel:
    return await prosthetics_service.create_prosthetic(prosthetic_data, session)


@prosthetics_router.get(
    "/{prosthetic_id}",
    status_code=status.HTTP_200_OK,
    response_model=ProstheticResponseModel,
)
async def get_prosthetic(
    prosthetic_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> ProstheticResponseModel:
    return await prosthetics_service.get_prosthetic_by_id(prosthetic_id, session)


@prosthetics_router.patch(
    "/{prosthetic_id}",
    status_code=status.HTTP_200_OK,
    response_model=ProstheticResponseModel,
)
async def update_prosthetic(
    prosthetic_id: int,
    prosthetic_data: ProstheticUpdateModel,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> ProstheticResponseModel:
    return await prosthetics_service.update_prosthetic(
        prosthetic_id, prosthetic_data, session
    )


@prosthetics_router.delete(
    "/{prosthetic_id}",
    status_code=status.HTTP_200_OK,
    response_model=ProstheticResponseModel,
)
async def delete_prosthetic(
    prosthetic_id: int,
    session: AsyncSession = Depends(get_session),
    _: dict = Depends(access_token_bearer),
) -> ProstheticResponseModel:
    return await prosthetics_service.delete_prosthetic(prosthetic_id, session)
