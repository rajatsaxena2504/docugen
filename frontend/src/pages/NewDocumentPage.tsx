import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '@/components/common/Layout'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import TemplateSelector from '@/components/documents/TemplateSelector'
import { useCreateDocument } from '@/hooks/useDocuments'
import { useProject } from '@/hooks/useProjects'
import { PageLoading } from '@/components/common/Loading'
import type { DocumentType } from '@/types'

export default function NewDocumentPage() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const actualProjectId = projectId || searchParams.get('project')

  const { data: project, isLoading: projectLoading } = useProject(actualProjectId || '')
  const createDocument = useCreateDocument()

  const [title, setTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentType | null>(null)

  if (projectLoading) return <Layout><PageLoading /></Layout>

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </Layout>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !selectedTemplate || !actualProjectId) return

    createDocument.mutate(
      {
        project_id: actualProjectId,
        document_type_id: selectedTemplate.id,
        title,
      },
      {
        onSuccess: (doc) => {
          navigate(`/documents/${doc.id}/review`)
        },
      }
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Document</h1>
          <p className="text-sm text-gray-500">
            Generate documentation for <span className="font-medium">{project.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border bg-white p-6">
            <Input
              id="title"
              label="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., API Documentation for MyProject"
              required
            />
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Select Document Type</h2>
            <TemplateSelector
              selectedId={selectedTemplate?.id || null}
              onSelect={setSelectedTemplate}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={createDocument.isPending}
            disabled={!title || !selectedTemplate}
          >
            Continue to Section Review
          </Button>
        </form>
      </div>
    </Layout>
  )
}
