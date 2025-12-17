"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Projects table
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('source_type', sa.String(50), nullable=False),
        sa.Column('github_url', sa.String(500)),
        sa.Column('storage_path', sa.String(500)),
        sa.Column('analysis_data', postgresql.JSONB()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Document types table
    op.create_table(
        'document_types',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('is_system', sa.Boolean(), server_default='true'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Sections library table
    op.create_table(
        'sections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('default_order', sa.Integer()),
        sa.Column('applicable_doc_types', postgresql.ARRAY(postgresql.UUID(as_uuid=True))),
        sa.Column('is_system', sa.Boolean(), server_default='true'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Document type sections mapping
    op.create_table(
        'document_type_sections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('document_type_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('document_types.id', ondelete='CASCADE'), nullable=False),
        sa.Column('section_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sections.id', ondelete='CASCADE'), nullable=False),
        sa.Column('default_order', sa.Integer()),
        sa.Column('is_required', sa.Boolean(), server_default='false'),
        sa.UniqueConstraint('document_type_id', 'section_id', name='uq_doctype_section'),
    )

    # Documents table
    op.create_table(
        'documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_type_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('document_types.id')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('status', sa.String(50), server_default='draft'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Document sections table
    op.create_table(
        'document_sections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('document_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('section_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sections.id')),
        sa.Column('custom_title', sa.String(255)),
        sa.Column('custom_description', sa.Text()),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_included', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Generated content table
    op.create_table(
        'generated_content',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('document_section_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('document_sections.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('version', sa.Integer(), server_default='1'),
        sa.Column('is_ai_generated', sa.Boolean(), server_default='true'),
        sa.Column('generated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('document_section_id', 'version', name='uq_section_version'),
    )


def downgrade() -> None:
    op.drop_table('generated_content')
    op.drop_table('document_sections')
    op.drop_table('documents')
    op.drop_table('document_type_sections')
    op.drop_table('sections')
    op.drop_table('document_types')
    op.drop_table('projects')
    op.drop_table('users')
