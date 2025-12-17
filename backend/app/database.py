from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create database engine with appropriate settings for SQLite or PostgreSQL
if settings.database_url.startswith("sqlite"):
    # SQLite doesn't support pool_size/max_overflow, needs check_same_thread=False
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
