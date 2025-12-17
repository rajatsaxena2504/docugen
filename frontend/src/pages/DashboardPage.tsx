import { Link } from 'react-router-dom'
import { FolderOpen, FileText, Plus, ArrowRight } from 'lucide-react'
import Layout from '@/components/common/Layout'
import Button from '@/components/common/Button'
import { useProjects } from '@/hooks/useProjects'
import { useDocuments } from '@/hooks/useDocuments'
import { PageLoading } from '@/components/common/Loading'
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/helpers'

export default function DashboardPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: documents, isLoading: documentsLoading } = useDocuments()

  if (projectsLoading || documentsLoading) return <Layout><PageLoading /></Layout>

  const recentProjects = projects?.slice(0, 3) || []
  const recentDocuments = documents?.slice(0, 5) || []

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to DocuGen - AI-powered documentation generator</p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Link
          to="/projects/new"
          className="flex items-center gap-4 rounded-xl border bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
            <Plus className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">New Project</h3>
            <p className="text-sm text-gray-500">Upload code or connect GitHub</p>
          </div>
        </Link>

        <Link
          to="/documents"
          className="flex items-center gap-4 rounded-xl border bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">View Documents</h3>
            <p className="text-sm text-gray-500">Manage your documentation</p>
          </div>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No projects yet</p>
                <Link to="/projects/new" className="mt-3 inline-block">
                  <Button size="sm">Create Project</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(project.created_at)}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent Documents</h2>
            <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No documents yet</p>
                <p className="text-xs text-gray-400">Create a project first, then generate docs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}/edit`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(doc.updated_at)}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
