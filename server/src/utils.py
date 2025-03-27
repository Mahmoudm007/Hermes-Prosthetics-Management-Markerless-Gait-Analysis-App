from pydantic import BaseModel, Field, create_model
from pydantic.fields import FieldInfo
from typing import Any, Generic, List, Optional, Tuple, Type, TypeVar
import humps.camel
from copy import deepcopy


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase for API representation."""

    return humps.camel.case(string)


def partial_model(model: Type[BaseModel]):
    def make_field_optional(
        field: FieldInfo, default: Any = None
    ) -> Tuple[Any, FieldInfo]:
        new = deepcopy(field)
        new.default = default
        new.annotation = Optional[field.annotation]
        return new.annotation, new

    return create_model(
        f"Partial{model.__name__}",
        __base__=model,
        __module__=model.__module__,
        **{
            field_name: make_field_optional(field_info)
            for field_name, field_info in model.__fields__.items()
        },
    )


M = TypeVar("M")


class PaginatedResponse(BaseModel, Generic[M]):
    items: List[M] = Field(
        description="List of items returned in the response following given criteria"
    )
    page: int = Field(description="Page number (1-based)")
    count: int = Field(description="Total number of items")
    total_pages: int = Field(description="Total number of pages")
    has_next_page: bool = Field(description="Whether there is a next page")

    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True
