import { useProjects, useDeleteProject } from '@/hooks/useProjects'
import ProjectCard from './ProjectCard'
import { PageLoading } from '@/components/common/Loading'
import { FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'

export default function ProjectList() {
  const { data: projects, isLoading, error } = useProjects()
  const deleteProject = useDeleteProject()

  if (isLoading) return <PageLoading />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">Failed to load projects</p>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first project
        </p>
        <Link to="/projects/new" className="mt-4 inline-block">
          <Button>Create Project</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={(id) => deleteProject.mutate(id)}
        />
      ))}
    </div>
  )
}
