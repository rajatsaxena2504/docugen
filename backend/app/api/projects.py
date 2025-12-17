import os
import uuid
import shutil
import zipfile
import tarfile
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.config import settings
from app.models import User, Project
from app.schemas import ProjectResponse, ProjectWithAnalysis, GitHubProjectCreate
from app.services.code_analyzer import CodeAnalyzer
from app.services.github_service import GitHubService

router = APIRouter()


def extract_archive(file_path: str, extract_path: str) -> None:
    """Extract zip or tar.gz archive."""
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
    elif file_path.endswith('.tar.gz') or file_path.endswith('.tgz'):
        with tarfile.open(file_path, 'r:gz') as tar_ref:
            tar_ref.extractall(extract_path)
    elif file_path.endswith('.tar'):
        with tarfile.open(file_path, 'r:') as tar_ref:
            tar_ref.extractall(extract_path)
    else:
        raise ValueError("Unsupported archive format")


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all projects for the current user."""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project from uploaded archive."""
    # Validate file type
    allowed_extensions = ['.zip', '.tar.gz', '.tgz', '.tar']
    file_ext = None
    for ext in allowed_extensions:
        if file.filename.lower().endswith(ext):
            file_ext = ext
            break

    if not file_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Supported: .zip, .tar.gz, .tgz, .tar",
        )

    # Create unique storage path
    project_id = uuid.uuid4()
    storage_path = os.path.join(settings.upload_dir, str(current_user.id), str(project_id))
    os.makedirs(storage_path, exist_ok=True)

    # Save uploaded file
    temp_file_path = os.path.join(storage_path, f"archive{file_ext}")
    try:
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            if len(content) > settings.max_upload_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Maximum size: {settings.max_upload_size // (1024*1024)}MB",
                )
            buffer.write(content)

        # Extract archive
        extract_path = os.path.join(storage_path, "code")
        os.makedirs(extract_path, exist_ok=True)
        extract_archive(temp_file_path, extract_path)

        # Remove temp archive file
        os.remove(temp_file_path)

    except Exception as e:
        # Cleanup on error
        if os.path.exists(storage_path):
            shutil.rmtree(storage_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process upload: {str(e)}",
        )

    # Create project record
    project = Project(
        id=project_id,
        user_id=current_user.id,
        name=name,
        description=description,
        source_type="upload",
        storage_path=storage_path,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.post("/github", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project_from_github(
    project_data: GitHubProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project from GitHub repository."""
    github_service = GitHubService()

    # Create unique storage path
    project_id = uuid.uuid4()
    storage_path = os.path.join(settings.upload_dir, str(current_user.id), str(project_id))

    try:
        # Clone repository
        repo_info = github_service.clone_repository(
            str(project_data.github_url),
            storage_path,
        )

        # Use repo name if not provided
        name = project_data.name or repo_info.get("name", "Untitled Project")
        description = project_data.description or repo_info.get("description", "")

    except Exception as e:
        # Cleanup on error
        if os.path.exists(storage_path):
            shutil.rmtree(storage_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to clone repository: {str(e)}",
        )

    # Create project record
    project = Project(
        id=project_id,
        user_id=current_user.id,
        name=name,
        description=description,
        source_type="github",
        github_url=str(project_data.github_url),
        storage_path=storage_path,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get("/{project_id}", response_model=ProjectWithAnalysis)
def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get project details."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id,
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id,
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Delete storage files
    if project.storage_path and os.path.exists(project.storage_path):
        shutil.rmtree(project.storage_path)

    db.delete(project)
    db.commit()


@router.get("/{project_id}/analysis", response_model=ProjectWithAnalysis)
def get_project_analysis(
    project_id: uuid.UUID,
    refresh: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get or trigger code analysis for a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id,
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Return cached analysis if available and refresh not requested
    if project.analysis_data and not refresh:
        return project

    # Run analysis
    analyzer = CodeAnalyzer()
    code_path = os.path.join(project.storage_path, "code") if project.source_type == "upload" else project.storage_path

    try:
        analysis_data = analyzer.analyze(code_path)
        project.analysis_data = analysis_data
        db.commit()
        db.refresh(project)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )

    return project
