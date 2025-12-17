import client from './client'
import type {
  Document,
  DocumentWithSections,
  DocumentSection,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateSectionRequest,
  UpdateSectionRequest,
  ReorderSectionsRequest,
  SectionSuggestion,
} from '@/types'

export const documentsApi = {
  list: async (projectId?: string): Promise<Document[]> => {
    const response = await client.get<Document[]>('/documents', {
      params: projectId ? { project_id: projectId } : undefined,
    })
    return response.data
  },

  get: async (id: string): Promise<DocumentWithSections> => {
    const response = await client.get<DocumentWithSections>(`/documents/${id}`)
    return response.data
  },

  create: async (data: CreateDocumentRequest): Promise<Document> => {
    const response = await client.post<Document>('/documents', data)
    return response.data
  },

  update: async (id: string, data: UpdateDocumentRequest): Promise<Document> => {
    const response = await client.put<Document>(`/documents/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/documents/${id}`)
  },

  // Section suggestions
  getSuggestions: async (id: string): Promise<SectionSuggestion[]> => {
    const response = await client.get<SectionSuggestion[]>(`/documents/${id}/suggestions`)
    return response.data
  },

  // Sections management
  getSections: async (id: string): Promise<DocumentSection[]> => {
    const response = await client.get<DocumentSection[]>(`/documents/${id}/sections`)
    return response.data
  },

  addSection: async (documentId: string, data: CreateSectionRequest): Promise<DocumentSection> => {
    const response = await client.post<DocumentSection>(`/documents/${documentId}/sections`, data)
    return response.data
  },

  updateSection: async (
    documentId: string,
    sectionId: string,
    data: UpdateSectionRequest
  ): Promise<DocumentSection> => {
    const response = await client.put<DocumentSection>(
      `/documents/${documentId}/sections/${sectionId}`,
      data
    )
    return response.data
  },

  deleteSection: async (documentId: string, sectionId: string): Promise<void> => {
    await client.delete(`/documents/${documentId}/sections/${sectionId}`)
  },

  reorderSections: async (documentId: string, data: ReorderSectionsRequest): Promise<void> => {
    await client.post(`/documents/${documentId}/sections/reorder`, data)
  },

  updateSectionContent: async (
    documentId: string,
    sectionId: string,
    content: string
  ): Promise<DocumentSection> => {
    const response = await client.put<DocumentSection>(
      `/documents/${documentId}/sections/${sectionId}/content`,
      null,
      { params: { content } }
    )
    return response.data
  },
}
