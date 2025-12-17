"""Database-agnostic type definitions for SQLAlchemy models."""
import json
import uuid
from sqlalchemy import TypeDecorator, String, JSON, Text
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB, ARRAY


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type when available, otherwise uses CHAR(36).
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(value)
        return value


class JSONType(TypeDecorator):
    """Platform-independent JSON type.

    Uses PostgreSQL's JSONB type when available, otherwise uses standard JSON.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(JSONB())
        else:
            return dialect.type_descriptor(JSON())


class GUIDArray(TypeDecorator):
    """Platform-independent array of GUIDs.

    Uses PostgreSQL's ARRAY(UUID) when available, otherwise uses JSON array of strings.
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(ARRAY(PostgresUUID(as_uuid=True)))
        else:
            return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            # Convert list of UUIDs to JSON string
            return json.dumps([str(v) if isinstance(v, uuid.UUID) else v for v in value])

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            # Convert JSON string back to list of UUIDs
            parsed = json.loads(value)
            return [uuid.UUID(v) if isinstance(v, str) else v for v in parsed]
