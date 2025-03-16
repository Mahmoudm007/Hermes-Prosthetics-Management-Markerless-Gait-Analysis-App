from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from src.db.main import get_session
from src.auth.service import UsersService
from src.auth.schema import (
    UserCreateModel,
    UserLoginModel,
    UserResponseModel,
)
from src.auth.dependencies import (
    RefreshTokenBearer,
    get_current_user,
)
from src.auth.utils import create_access_token, verify_password


users_router = APIRouter()
users_service = UsersService()


@users_router.post(
    "/signup", status_code=status.HTTP_201_CREATED, response_model=UserResponseModel
)
async def create_user_account(
    user_data: UserCreateModel, session: AsyncSession = Depends(get_session)
) -> UserResponseModel:
    email = user_data.email
    user_exists = await users_service.user_exists(email, session)

    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    new_user = await users_service.create_user(user_data, session)
    return new_user


@users_router.post("/login")
async def login_user(
    login_data: UserLoginModel, session: AsyncSession = Depends(get_session)
):
    response = await users_service.verify_user(login_data, session)

    return response


@users_router.get("/refresh")
async def get_new_access_token(token_details: dict = Depends(RefreshTokenBearer())):
    expiry_timestamp = token_details["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(user=token_details["user"])
        return JSONResponse(content={"access_token": new_access_token})

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
    )


# @users_router.post("/logout")
# async def revoke_token(token_details: dict = Depends(AccessTokenBearer())):

#     jti = token_details["jti"]

#     await add_jti_to_blocklist(jti)

#     return JSONResponse(
#         content={"message": "Logged Out Successfully"}, status_code=status.HTTP_200_OK
#     )


@users_router.get("/me")
async def get_user(
    user: UserResponseModel = Depends(get_current_user),
) -> UserResponseModel:
    return user
