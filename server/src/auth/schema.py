from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from src.db.model.enum import Sex
from src.utils import to_camel


class UserBaseModel(BaseModel):
    """Base schema for User, enforcing camelCase in API."""

    email: EmailStr = Field(
        ..., example="user@example.com", description="Unique email address of the user."
    )
    first_name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        example="John",
        description="User's first name.",
    )
    last_name: str = Field(
        ..., min_length=2, max_length=50, example="Doe", description="User's last name."
    )
    sex: Sex = Field(
        default=Sex.Male, example="Male", description="Biological sex of the user."
    )
    birth_date: datetime = Field(
        ..., example="1990-01-01T00:00:00", description="User's date of birth."
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class UserCreateModel(UserBaseModel):
    """Schema for creating a new User."""

    password: str = Field(
        ..., min_length=8, example="StrongP@ssw0rd", description="User's password."
    )


class UserUpdateModel(BaseModel):
    """Schema for updating an existing User."""

    first_name: str | None = Field(
        None,
        min_length=2,
        max_length=50,
        example="John",
        description="Updated first name.",
    )
    last_name: str | None = Field(
        None,
        min_length=2,
        max_length=50,
        example="Doe",
        description="Updated last name.",
    )
    sex: Sex | None = Field(None, example="Male", description="Updated biological sex.")
    birth_date: datetime | None = Field(
        None, example="1990-01-01T00:00:00", description="Updated birth date."
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True


class UserResponseModel(UserBaseModel):
    """Schema for retrieving a User (GET response)."""

    id: int = Field(..., example=1, description="Unique identifier for the user.")
    created_at: datetime = Field(
        ...,
        example="2024-03-10T12:00:00",
        description="Timestamp when the user was created.",
    )
    updated_at: datetime = Field(
        ...,
        example="2024-03-12T15:30:00",
        description="Timestamp when the user was last updated.",
    )

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class UserLoginModel(BaseModel):
    email: EmailStr = Field(
        ..., example="user@example.com", description="Unique email address of the user."
    )
    password: str = Field(
        ..., min_length=8, example="StrongP@ssw0rd", description="User's password."
    )
