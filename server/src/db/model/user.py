from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

from src.utils import to_camel
from src.db.model.enum import Sex


class User(SQLModel, table=True):
    """User model representing system users."""

    __tablename__ = "user"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True,
        description="Unique identifier for the user.",
    )
    email: str = Field(
        unique=True, index=True, description="Unique email address of the user."
    )
    first_name: str = Field(description="User's first name.")
    last_name: str = Field(description="User's last name.")
    password: str = Field(
        description="Hashed password for authentication.", exclude=True
    )
    sex: Sex = Field(default=Sex.Unknown, description="Biological sex of the user.")
    birth_date: datetime = Field(description="User's date of birth.")

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the user was created.",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the user was last updated.",
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.first_name} {self.last_name})>"

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
