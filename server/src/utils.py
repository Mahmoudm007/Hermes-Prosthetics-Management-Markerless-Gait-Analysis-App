from pydantic import BaseModel, create_model
from typing import Optional, Type
import humps.camel


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase for API representation."""

    return humps.camel.case(string)


def make_optional(model: Type[BaseModel]) -> Type[BaseModel]:
    """Creates a new Pydantic model with all fields from `model` set as optional."""
    fields = {
        name: (Optional[typ], None) for name, typ in model.__annotations__.items()
    }
    return create_model(f"Partial{model.__name__}", **fields, __base__=model)
