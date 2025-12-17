from typing import Any
from sqlalchemy.orm import Session
from app.models import Section, DocumentType, DocumentTypeSection
from app.services.claude_service import ClaudeService


class SectionSuggester:
    """Service for suggesting document sections based on codebase analysis."""

    def __init__(self, db: Session):
        self.db = db
        self.claude_service = ClaudeService()

    def get_default_sections(self, document_type_id: str, as_suggestions: bool = True) -> list[dict]:
        """Get default sections for a document type.

        Args:
            document_type_id: The document type ID
            as_suggestions: If True, return in suggestion format (for API fallback)
        """
        mappings = (
            self.db.query(DocumentTypeSection)
            .filter(DocumentTypeSection.document_type_id == document_type_id)
            .order_by(DocumentTypeSection.default_order)
            .all()
        )

        sections = []
        for mapping in mappings:
            section = mapping.section
            if as_suggestions:
                # Return in suggestion format (matches AI suggestions)
                sections.append({
                    'section_id': str(section.id),
                    'name': section.name,
                    'description': section.description,
                    'relevance_score': 0.9 if mapping.is_required else 0.8,
                    'reason': 'Default section for this document type',
                    'is_custom': False,
                })
            else:
                # Return raw format
                sections.append({
                    'id': str(section.id),
                    'name': section.name,
                    'description': section.description,
                    'default_order': mapping.default_order,
                    'is_required': mapping.is_required,
                })

        return sections

    def get_all_sections(self) -> list[dict]:
        """Get all available sections from the library."""
        sections = self.db.query(Section).filter(Section.is_system == True).all()

        return [
            {
                'id': str(s.id),
                'name': s.name,
                'description': s.description,
                'default_order': s.default_order,
            }
            for s in sections
        ]

    def suggest_sections(
        self,
        document_type_id: str,
        code_analysis: dict[str, Any],
    ) -> list[dict]:
        """Suggest relevant sections based on document type and code analysis."""
        # Get document type info
        doc_type = self.db.query(DocumentType).filter(
            DocumentType.id == document_type_id
        ).first()

        if not doc_type:
            raise ValueError("Document type not found")

        # Get default sections for this document type (raw format for merging)
        default_sections = self.get_default_sections(document_type_id, as_suggestions=False)

        # Get all available sections
        all_sections = self.get_all_sections()

        # Use Claude to analyze relevance
        suggestions = self.claude_service.suggest_sections(
            document_type=doc_type.name,
            code_analysis=code_analysis,
            available_sections=all_sections,
        )

        # Merge AI suggestions with default sections
        result = []
        seen_names = set()

        # First, add default sections with boosted scores
        for section in default_sections:
            ai_suggestion = next(
                (s for s in suggestions if s['name'].lower() == section['name'].lower()),
                None
            )

            result.append({
                'section_id': section['id'],
                'name': section['name'],
                'description': section['description'],
                'relevance_score': min(1.0, (ai_suggestion['relevance_score'] if ai_suggestion else 0.7) + 0.2),
                'reason': ai_suggestion['reason'] if ai_suggestion else 'Default section for this document type',
                'is_custom': False,
            })
            seen_names.add(section['name'].lower())

        # Add AI-suggested sections not in defaults
        for suggestion in suggestions:
            if suggestion['name'].lower() not in seen_names:
                # Find matching section from library
                matching_section = next(
                    (s for s in all_sections if s['name'].lower() == suggestion['name'].lower()),
                    None
                )

                if matching_section and suggestion['relevance_score'] >= 0.5:
                    result.append({
                        'section_id': matching_section['id'],
                        'name': matching_section['name'],
                        'description': matching_section['description'],
                        'relevance_score': suggestion['relevance_score'],
                        'reason': suggestion['reason'],
                        'is_custom': False,
                    })
                    seen_names.add(suggestion['name'].lower())

        # Sort by relevance score
        result.sort(key=lambda x: x['relevance_score'], reverse=True)

        return result
