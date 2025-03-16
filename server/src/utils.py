import humps.camel


def to_camel(string: str) -> str:
    """Converts snake_case to camelCase for API representation."""

    return humps.camel.case(string)
