import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments'
import DocumentCard from './DocumentCard'
import { PageLoading } from '@/components/common/Loading'
import { FileText } from 'lucide-react'

interface DocumentListProps {
  projectId?: string
}

export default function DocumentList({ projectId }: DocumentListProps) {
  const { data: documents, isLoading, error } = useDocuments(projectId)
  const deleteDocument = useDeleteDocument()

  if (isLoading) return <PageLoading />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">Failed to load documents</p>
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No documents yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Create a document to generate AI-powered documentation
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={(id) => deleteDocument.mutate(id)}
        />
      ))}
    </div>
  )
}
