import os
import re
from typing import Any
from git import Repo
from app.config import settings


class GitHubService:
    """Service for interacting with GitHub repositories."""

    def __init__(self):
        self.token = settings.github_token

    def parse_github_url(self, url: str) -> dict[str, str]:
        """Parse GitHub URL to extract owner and repo name."""
        # Handle various GitHub URL formats
        patterns = [
            r'github\.com/([^/]+)/([^/]+?)(?:\.git)?$',
            r'github\.com:([^/]+)/([^/]+?)(?:\.git)?$',
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return {
                    'owner': match.group(1),
                    'repo': match.group(2),
                }

        raise ValueError(f"Invalid GitHub URL: {url}")

    def clone_repository(self, url: str, destination: str) -> dict[str, Any]:
        """Clone a GitHub repository to the specified destination."""
        parsed = self.parse_github_url(url)

        # Create destination directory
        os.makedirs(destination, exist_ok=True)

        # Prepare clone URL with token if available
        clone_url = url
        if self.token and 'https://' in url:
            # Insert token for authentication
            clone_url = url.replace('https://', f'https://{self.token}@')

        try:
            # Clone with depth=1 for faster cloning (shallow clone)
            repo = Repo.clone_from(
                clone_url,
                destination,
                depth=1,
                single_branch=True,
            )

            # Get repository info
            return {
                'name': parsed['repo'],
                'owner': parsed['owner'],
                'description': '',  # Would need GitHub API for this
                'default_branch': repo.active_branch.name,
                'clone_path': destination,
            }

        except Exception as e:
            raise RuntimeError(f"Failed to clone repository: {str(e)}")

    def get_repository_info(self, url: str) -> dict[str, Any]:
        """Get repository information from GitHub API."""
        # This would use PyGithub for more detailed info
        # For now, just parse the URL
        parsed = self.parse_github_url(url)
        return {
            'name': parsed['repo'],
            'owner': parsed['owner'],
            'url': url,
        }
