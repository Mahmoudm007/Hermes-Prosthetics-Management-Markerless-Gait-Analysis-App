from datetime import datetime, timedelta
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.models import User
from src.auth.schema import UserCreateModel, UserLoginModel
from src.auth.utils import create_access_token, generate_password_hash, verify_password

REFRESH_TOKEN_EXPIRY = 2


class UsersService:
    async def get_user_by_email(self, email: str, session: AsyncSession) -> User | None:
        statement = select(User).where(User.email == email)
        result = await session.exec(statement)
        user = result.first()
        return user if user is not None else None

    async def user_exists(self, email: str, session: AsyncSession) -> bool:
        user = await self.get_user_by_email(email, session)
        return user is not None

    async def create_user(
        self, user_data: UserCreateModel, session: AsyncSession
    ) -> User:
        user_data_dict = user_data.model_dump()
        new_user = User(**user_data_dict)
        new_user.password = generate_password_hash(user_data.password)
        session.add(new_user)
        await session.commit()
        return new_user

    async def verify_user(
        self, login_data: UserLoginModel, session: AsyncSession
    ) -> JSONResponse:
        email = login_data.email
        password = login_data.password

        user = await self.get_user_by_email(email, session)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email does not exist",
            )

        password_valid = verify_password(password, user.password)

        if not password_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password",
            )

        user_data = {
            **user.model_dump(),
            "created_at": (
                user.created_at.isoformat()
                if isinstance(user.created_at, datetime)
                else user.created_at
            ),
            "updated_at": (
                user.updated_at.isoformat()
                if isinstance(user.updated_at, datetime)
                else user.updated_at
            ),
            "birth_date": (
                user.birth_date.isoformat()
                if isinstance(user.birth_date, datetime)
                else user.birth_date
            ),
        }

        access_token = create_access_token(user=user_data)

        refresh_token = create_access_token(
            user=user_data,
            expiry=timedelta(days=REFRESH_TOKEN_EXPIRY),
            refresh=True,
        )

        return JSONResponse(
            content={
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user_data,
            }
        )
