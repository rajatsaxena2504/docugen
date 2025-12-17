import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import type { GitHubProjectRequest } from '@/types'
import toast from 'react-hot-toast'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  })
}

export function useProjectAnalysis(id: string, enabled = true) {
  return useQuery({
    queryKey: ['projects', id, 'analysis'],
    queryFn: () => projectsApi.getAnalysis(id),
    enabled: !!id && enabled,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })
}

export function useCreateGitHubProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GitHubProjectRequest) => projectsApi.createFromGitHub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created from GitHub')
    },
    onError: () => {
      toast.error('Failed to clone repository')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })
}

export function useRefreshAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsApi.getAnalysis(id, true),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      toast.success('Analysis refreshed')
    },
    onError: () => {
      toast.error('Failed to refresh analysis')
    },
  })
}
