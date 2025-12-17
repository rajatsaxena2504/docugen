import client from './client'
import type { Project, ProjectWithAnalysis, GitHubProjectRequest } from '@/types'

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const response = await client.get<Project[]>('/projects')
    return response.data
  },

  get: async (id: string): Promise<ProjectWithAnalysis> => {
    const response = await client.get<ProjectWithAnalysis>(`/projects/${id}`)
    return response.data
  },

  create: async (data: FormData): Promise<Project> => {
    const response = await client.post<Project>('/projects', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  createFromGitHub: async (data: GitHubProjectRequest): Promise<Project> => {
    const response = await client.post<Project>('/projects/github', data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/projects/${id}`)
  },

  getAnalysis: async (id: string, refresh = false): Promise<ProjectWithAnalysis> => {
    const response = await client.get<ProjectWithAnalysis>(
      `/projects/${id}/analysis`,
      { params: { refresh } }
    )
    return response.data
  },
}
