# DocuGen - AI-Powered Documentation Generator

DocuGen is a full-stack application that automatically generates professional documentation for your codebase using AI. Simply provide a GitHub repository URL, select a documentation template, and let AI analyze your code to generate comprehensive documentation.

## Features

- **GitHub Integration**: Analyze any public GitHub repository by URL
- **Multiple AI Providers**: Supports Google Gemini (primary) and Anthropic Claude (fallback)
- **Template Library**: Pre-built templates for various documentation types:
  - Requirements Document
  - Design Document
  - Technical Specification
  - API Documentation
  - User Guide
  - README
  - Developer Guide
- **Human-in-the-Loop**: Review and customize AI-suggested sections before generation
- **Section Editing**: Inline editing of section titles and descriptions
- **Drag & Drop Reordering**: Reorganize sections with drag-and-drop
- **Rich Text Editor**: Edit generated content with full markdown support
- **Multi-Format Export**: Export to Markdown, DOCX, or PDF
- **Placeholder Fallback**: Works without AI keys using smart placeholder content

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with SQLite (dev) / PostgreSQL (prod) support
- **Google Generative AI** - Gemini API integration
- **Anthropic** - Claude API integration (fallback)

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Server state management
- **dnd-kit** - Drag and drop
- **TipTap** - Rich text editor

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/docugen.git
cd docugen
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GEMINI_API_KEY=your-gemini-api-key      # Get from https://aistudio.google.com/app/apikey
ANTHROPIC_API_KEY=your-anthropic-key    # Optional fallback
```

### 3. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend will:
- Create SQLite database automatically
- Seed default templates and sections
- Start on http://localhost:8000

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Usage

1. **Enter GitHub URL**: Paste any public GitHub repository URL
2. **Select Template**: Choose a documentation template (or upload your own)
3. **Review Sections**: AI suggests relevant sections based on code analysis
4. **Customize**: Edit section titles, descriptions, reorder, add/remove
5. **Generate**: AI generates content for each section
6. **Edit & Export**: Fine-tune content and export to your preferred format

## API Endpoints

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/{id}` - Get document with sections
- `PUT /api/documents/{id}` - Update document

### Generation
- `POST /api/generation/documents/{id}/generate` - Generate all sections
- `POST /api/generation/documents/{id}/sections/{section_id}/generate` - Regenerate specific section
- `GET /api/generation/documents/{id}/export?format=markdown|docx|pdf` - Export document

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/{id}` - Get template with default sections

## Project Structure

```
docugen/
├── backend/
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (AI, generation)
│   │   ├── data/          # Seed data (templates, sections)
│   │   └── config.py      # Configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── context/       # React context (auth, session)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   └── package.json
├── .env.example
└── README.md
```

## Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key (primary AI) | Recommended |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key (fallback) | Optional |
| `DATABASE_URL` | PostgreSQL URL (defaults to SQLite) | Optional |
| `SECRET_KEY` | JWT secret key | Yes |
| `GITHUB_TOKEN` | For private repos | Optional |

## AI Provider Priority

DocuGen uses a fallback chain for AI generation:
1. **Gemini** (if `GEMINI_API_KEY` set) - Fast, free tier available
2. **Anthropic Claude** (if `ANTHROPIC_API_KEY` set) - High quality
3. **Placeholder Content** - Smart templates when no AI available

## Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run lint
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/) and [Anthropic Claude](https://anthropic.com/)
