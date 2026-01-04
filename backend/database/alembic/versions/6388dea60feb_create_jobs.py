"""create jobs and users tables

Revision ID: 6388dea60feb
Revises: 
Create Date: 2025-12-27 00:12:44.238538

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = '6388dea60feb'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create users_table first (jobs_table has a foreign key to it)
    op.create_table('users_table',
    sa.Column('id', UUID(as_uuid=True), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('password', sa.String(), nullable=False),
    sa.Column('disabled', sa.Boolean(), nullable=True),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    
    # Create jobs_table with foreign key to users_table
    op.create_table('jobs_table',
    sa.Column('id', UUID(as_uuid=True), nullable=False),
    sa.Column('filename', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('transcript', sa.Text(), nullable=True),
    sa.Column('owner', UUID(as_uuid=True), nullable=False),
    sa.Column('stored_filename', sa.String(), nullable=False),
    sa.Column('error_message', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.ForeignKeyConstraint(['owner'], ['users_table.id'])
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('jobs_table')
    op.drop_table('users_table')
