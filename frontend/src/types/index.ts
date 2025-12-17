// User types
export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// Project types
export interface Project {
  id: string
  name: string
  description: string | null
  source_type: 'upload' | 'github'
  github_url: string | null
  created_at: string
  updated_at: string
}

export interface ProjectWithAnalysis extends Project {
  analysis_data: CodeAnalysis | null
}

export interface CodeAnalysis {
  file_tree: string[]
  languages: Record<string, number>
  config_files: string[]
  entry_points: string[]
  structure: {
    total_files: number
    total_dirs: number
    total_lines: number
  }
  key_files: Array<{
    path: string
    type: string
    name: string
  }>
  dependencies: Record<string, string[] | Record<string, string[]>>
  primary_language: string
}

// Document type/template types
export interface DocumentType {
  id: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
}

export interface DocumentTypeWithSections extends DocumentType {
  default_sections: Section[]
}

// Section types
export interface Section {
  id: string
  name: string
  description: string
  default_order: number | null
  is_system: boolean
  created_at: string
}

export interface SectionSuggestion {
  section_id: string | null
  name: string
  description: string
  relevance_score: number
  reason: string
  is_custom: boolean
}

// Document types
export interface Document {
  id: string
  project_id: string
  document_type_id: string | null
  title: string
  status: 'draft' | 'sections_approved' | 'generating' | 'completed'
  created_at: string
  updated_at: string
}

export interface DocumentSection {
  id: string
  section_id: string | null
  custom_title: string | null
  custom_description: string | null
  display_order: number
  is_included: boolean
  title: string
  description: string
  content: string | null
}

export interface DocumentWithSections extends Document {
  sections: DocumentSection[]
}

// API request types
export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface GitHubProjectRequest {
  github_url: string
  name?: string
  description?: string
}

export interface CreateDocumentRequest {
  project_id: string
  document_type_id?: string
  title: string
}

export interface UpdateDocumentRequest {
  title?: string
  status?: string
}

export interface CreateSectionRequest {
  section_id?: string
  custom_title?: string
  custom_description?: string
  display_order: number
}

export interface UpdateSectionRequest {
  custom_title?: string
  custom_description?: string
  is_included?: boolean
}

export interface ReorderSectionsRequest {
  section_orders: Array<{ id: string; display_order: number }>
}
