from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, HttpUrl


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class GitHubProjectCreate(BaseModel):
    github_url: HttpUrl
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    source_type: str
    github_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectWithAnalysis(ProjectResponse):
    analysis_data: Optional[dict[str, Any]]
