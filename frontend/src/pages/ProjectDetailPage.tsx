import { useParams, Link } from 'react-router-dom'
import { Plus, RefreshCw, FolderTree, Code2, FileCode, Package } from 'lucide-react'
import Layout from '@/components/common/Layout'
import Button from '@/components/common/Button'
import DocumentList from '@/components/documents/DocumentList'
import { PageLoading } from '@/components/common/Loading'
import { useProject, useRefreshAnalysis } from '@/hooks/useProjects'
import { formatDate } from '@/utils/helpers'

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const { data: project, isLoading } = useProject(projectId || '')
  const refreshAnalysis = useRefreshAnalysis()

  if (isLoading) {
    return (
      <Layout>
        <PageLoading />
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </Layout>
    )
  }

  const analysis = project.analysis_data

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-gray-500">{project.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-400">
            Created {formatDate(project.created_at)}
            {project.github_url && (
              <>
                {' • '}
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  View on GitHub
                </a>
              </>
            )}
          </p>
        </div>
        <Link to={`/projects/${project.id}/documents/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analysis Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-medium text-gray-900">Code Analysis</h2>
              <button
                onClick={() => refreshAnalysis.mutate(project.id)}
                disabled={refreshAnalysis.isPending}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Refresh analysis"
              >
                <RefreshCw className={`h-4 w-4 ${refreshAnalysis.isPending ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {analysis ? (
              <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <FolderTree className="h-4 w-4" />
                      <span className="text-xs">Files</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{analysis.structure.total_files}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Code2 className="h-4 w-4" />
                      <span className="text-xs">Lines</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">
                      {analysis.structure.total_lines.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-700">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analysis.languages)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([lang, count]) => (
                        <span
                          key={lang}
                          className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                        >
                          {lang}
                          <span className="ml-1 text-primary-500">({count})</span>
                        </span>
                      ))}
                  </div>
                </div>

                {/* Key Files */}
                {analysis.entry_points.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Entry Points</h3>
                    <div className="space-y-1">
                      {analysis.entry_points.slice(0, 3).map((file) => (
                        <div key={file} className="flex items-center gap-2 text-sm text-gray-600">
                          <FileCode className="h-3 w-3 text-gray-400" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {Object.keys(analysis.dependencies).length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Dependencies</h3>
                    {Object.entries(analysis.dependencies).map(([manager, deps]) => {
                      const depList = Array.isArray(deps)
                        ? deps
                        : deps.dependencies || []
                      return (
                        <div key={manager} className="mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package className="h-3 w-3" />
                            {manager}
                          </div>
                          <p className="text-sm text-gray-600">
                            {depList.slice(0, 5).join(', ')}
                            {depList.length > 5 && ` +${depList.length - 5} more`}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">Analysis not available</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => refreshAnalysis.mutate(project.id)}
                  isLoading={refreshAnalysis.isPending}
                >
                  Run Analysis
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Documents</h2>
          <DocumentList projectId={project.id} />
        </div>
      </div>
    </Layout>
  )
}
