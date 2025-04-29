from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision: str = "fca50937048a"
down_revision: Union[str, None] = "fe2263b33be8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "gait_session", sa.Column("detailed_ai_analysis", sa.TEXT(), nullable=True)
    )
    op.add_column(
        "gait_session", sa.Column("summarized_ai_analysis", sa.TEXT(), nullable=True)
    )
    op.add_column(
        "gait_session",
        sa.Column(
            "possible_abnormalities",
            sa.ARRAY(sa.TEXT()),
            nullable=False,
            server_default="{}",
        ),
    )
    op.add_column(
        "gait_session",
        sa.Column(
            "recommended_exercises",
            sa.ARRAY(sa.TEXT()),
            nullable=False,
            server_default="{}",
        ),
    )
    op.add_column(
        "gait_session",
        sa.Column(
            "long_term_risks", sa.ARRAY(sa.TEXT()), nullable=False, server_default="{}"
        ),
    )
    op.drop_column("gait_session", "ai_analysis")


def downgrade() -> None:
    op.add_column(
        "gait_session",
        sa.Column("ai_analysis", sa.TEXT(), autoincrement=False, nullable=True),
    )
    op.drop_column("gait_session", "long_term_risks")
    op.drop_column("gait_session", "recommended_exercises")
    op.drop_column("gait_session", "possible_abnormalities")
    op.drop_column("gait_session", "summarized_ai_analysis")
    op.drop_column("gait_session", "detailed_ai_analysis")
