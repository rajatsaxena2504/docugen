import client from './client'
import type { Section, DocumentType, DocumentTypeWithSections } from '@/types'

export const sectionsApi = {
  list: async (docTypeId?: string): Promise<Section[]> => {
    const response = await client.get<Section[]>('/sections', {
      params: docTypeId ? { doc_type: docTypeId } : undefined,
    })
    return response.data
  },

  get: async (id: string): Promise<Section> => {
    const response = await client.get<Section>(`/sections/${id}`)
    return response.data
  },

  create: async (data: {
    name: string
    description: string
    default_order?: number
    applicable_doc_types?: string[]
  }): Promise<Section> => {
    const response = await client.post<Section>('/sections', data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/sections/${id}`)
  },
}

export const templatesApi = {
  list: async (): Promise<DocumentType[]> => {
    const response = await client.get<DocumentType[]>('/templates')
    return response.data
  },

  get: async (id: string): Promise<DocumentTypeWithSections> => {
    const response = await client.get<DocumentTypeWithSections>(`/templates/${id}`)
    return response.data
  },

  create: async (data: { name: string; description?: string }): Promise<DocumentType> => {
    const response = await client.post<DocumentType>('/templates', data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/templates/${id}`)
  },
}

export const generationApi = {
  generateDocument: async (documentId: string): Promise<{
    document_id: string
    status: string
    results: Array<{
      section_id: string
      title: string
      success: boolean
      content_id?: string
      error?: string
    }>
  }> => {
    const response = await client.post(`/generation/documents/${documentId}/generate`)
    return response.data
  },

  regenerateSection: async (
    documentId: string,
    sectionId: string
  ): Promise<{
    section_id: string
    title: string
    content_id: string
    content: string
  }> => {
    const response = await client.post(
      `/generation/documents/${documentId}/sections/${sectionId}/generate`
    )
    return response.data
  },

  exportDocument: (documentId: string, format: 'markdown' | 'docx' | 'pdf'): string => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${API_URL}/api/generation/documents/${documentId}/export?format=${format}`
  },
}
