"""Unified AI service with Gemini (priority) and Anthropic (fallback) support."""
import json
from typing import Optional
from app.config import settings


class AIService:
    """Unified AI service that prioritizes Gemini, falls back to Anthropic."""

    def __init__(self):
        self.gemini_client = None
        self.anthropic_client = None
        self._init_clients()

    def _init_clients(self):
        """Initialize available AI clients."""
        # Try Gemini first (priority)
        if settings.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)
                # Use gemini-2.0-flash - fast and capable
                self.gemini_client = genai.GenerativeModel('gemini-2.0-flash')
                print("AI Service: Gemini initialized (primary)")
            except Exception as e:
                print(f"AI Service: Failed to initialize Gemini: {e}")

        # Try Anthropic as fallback
        if settings.anthropic_api_key:
            try:
                from anthropic import Anthropic
                self.anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
                print("AI Service: Anthropic initialized (fallback)")
            except Exception as e:
                print(f"AI Service: Failed to initialize Anthropic: {e}")

        if not self.gemini_client and not self.anthropic_client:
            print("AI Service: No AI provider available - will use placeholder content")

    def generate_content(self, prompt: str, system_prompt: str = "") -> str:
        """Generate content using available AI provider."""
        # Try Gemini first
        if self.gemini_client:
            try:
                return self._generate_with_gemini(prompt, system_prompt)
            except Exception as e:
                print(f"Gemini generation failed: {e}")

        # Try Anthropic as fallback
        if self.anthropic_client:
            try:
                return self._generate_with_anthropic(prompt, system_prompt)
            except Exception as e:
                print(f"Anthropic generation failed: {e}")

        # Both failed - raise to trigger placeholder
        raise Exception("No AI provider available or all providers failed")

    def _generate_with_gemini(self, prompt: str, system_prompt: str = "") -> str:
        """Generate content using Gemini."""
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        response = self.gemini_client.generate_content(full_prompt)
        return response.text

    def _generate_with_anthropic(self, prompt: str, system_prompt: str = "") -> str:
        """Generate content using Anthropic Claude."""
        kwargs = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = self.anthropic_client.messages.create(**kwargs)
        return response.content[0].text

    def suggest_sections(
        self,
        document_type: str,
        code_analysis: dict,
        available_sections: list[dict],
    ) -> list[dict]:
        """Use AI to suggest relevant sections for documentation."""
        system_prompt = """You are a technical documentation expert. Analyze the code and suggest the most relevant sections for documentation.
Return a JSON array of suggested sections with relevance scores."""

        sections_list = "\n".join([f"- {s['name']}: {s['description']}" for s in available_sections])

        prompt = f"""Based on this code analysis, suggest the most relevant documentation sections.

Document Type: {document_type}

Code Analysis:
- Primary Language: {code_analysis.get('primary_language', 'Unknown')}
- Frameworks: {', '.join(code_analysis.get('frameworks', []))}
- Has Tests: {code_analysis.get('has_tests', False)}
- Has API: {code_analysis.get('has_api', False)}
- File Count: {code_analysis.get('structure', {}).get('total_files', 0)}

Available Sections:
{sections_list}

Return a JSON array with objects containing:
- name: section name (must match available sections exactly)
- relevance_score: 0.0 to 1.0
- reason: brief explanation

Only include sections with relevance_score >= 0.5. Return ONLY valid JSON array, no other text."""

        try:
            response = self.generate_content(prompt, system_prompt)
            # Parse JSON from response
            json_str = response.strip()
            if json_str.startswith("```"):
                json_str = json_str.split("```")[1]
                if json_str.startswith("json"):
                    json_str = json_str[4:]
            return json.loads(json_str)
        except Exception as e:
            print(f"AI section suggestion failed: {e}")
            return []

    def generate_section_content(
        self,
        section_title: str,
        section_description: str,
        code_context: str,
        document_type: str,
    ) -> str:
        """Generate content for a documentation section."""
        system_prompt = f"""You are a technical writer creating {document_type} documentation.
Write clear, professional documentation that is:
- Well-structured with proper markdown formatting
- Technically accurate based on the code provided
- Concise but comprehensive
- Includes code examples where relevant"""

        prompt = f"""Write the "{section_title}" section for this documentation.

Section Purpose: {section_description}

Relevant Code:
{code_context}

Write professional documentation content in markdown format. Include:
- Clear explanations
- Code examples where helpful
- Any relevant warnings or notes

Do not include the section title as a header (it will be added separately)."""

        return self.generate_content(prompt, system_prompt)


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get or create the AI service singleton."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
