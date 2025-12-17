import { Link } from 'react-router-dom'
import { FolderOpen, Github, Trash2, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { cn, formatDate } from '@/utils/helpers'
import type { Project } from '@/types'
import Button from '@/components/common/Button'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group relative rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              project.source_type === 'github' ? 'bg-gray-900' : 'bg-primary-100'
            )}
          >
            {project.source_type === 'github' ? (
              <Github className="h-5 w-5 text-white" />
            ) : (
              <FolderOpen className="h-5 w-5 text-primary-600" />
            )}
          </div>
          <div>
            <Link
              to={`/projects/${project.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600"
            >
              {project.name}
            </Link>
            <p className="text-xs text-gray-500">
              {project.source_type === 'github' ? 'GitHub' : 'Uploaded'} • {formatDate(project.created_at)}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    onDelete(project.id)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {project.description && (
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{project.description}</p>
      )}

      <div className="flex gap-2">
        <Link to={`/projects/${project.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <Link to={`/projects/${project.id}/documents/new`}>
          <Button size="sm">Create Document</Button>
        </Link>
      </div>
    </div>
  )
}
