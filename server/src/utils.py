from pydantic import BaseModel, create_model
from pydantic.fields import FieldInfo
from typing import Any, Optional, Tuple, Type
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
