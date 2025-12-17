import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader2,
  Edit3,
  X,
  Home,
} from 'lucide-react'
import { useSession, DocumentStatus } from '@/context/SessionContext'
import { cn } from '@/utils/helpers'

export default function DocumentSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { documents, activeDocumentId, setActiveDocument, deleteDocument } = useSession()
  const [isExpanded, setIsExpanded] = useState(true)

  const handleNewDocument = () => {
    navigate('/')
  }

  const handleSelectDocument = (docId: string) => {
    setActiveDocument(docId)
    // Navigate to appropriate page based on document status
    const doc = documents.find(d => d.id === docId)
    if (doc) {
      switch (doc.status) {
        case 'analyzing':
        case 'ready':
          navigate(`/documents/${docId}/review`)
          break
        case 'generating':
          navigate(`/documents/${docId}/generating`)
          break
        case 'editing':
        case 'completed':
          navigate(`/documents/${docId}/edit`)
          break
      }
    }
  }

  const handleDeleteDocument = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(docId)
    }
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'analyzing':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'ready':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'generating':
        return <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
      case 'editing':
        return <Edit3 className="h-3 w-3 text-orange-500" />
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
    }
  }

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'analyzing':
        return 'Analyzing'
      case 'ready':
        return 'Ready'
      case 'generating':
        return 'Generating'
      case 'editing':
        return 'Editing'
      case 'completed':
        return 'Completed'
    }
  }

  if (documents.length === 0) {
    return null // Don't show sidebar if no documents
  }

  return (
    <div className={cn(
      'fixed left-0 top-0 z-40 h-full bg-white shadow-lg transition-all',
      isExpanded ? 'w-64' : 'w-12'
    )}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-900">Documents</span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronRight className={cn(
            'h-5 w-5 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </button>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-3.5rem)] flex-col">
        {isExpanded ? (
          <>
            {/* Home Link */}
            <button
              onClick={() => navigate('/')}
              className={cn(
                'flex items-center gap-2 border-b px-3 py-2 text-sm text-gray-600 hover:bg-gray-50',
                location.pathname === '/' && 'bg-gray-50 text-primary-600'
              )}
            >
              <Home className="h-4 w-4" />
              Home
            </button>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto py-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc.id)}
                  className={cn(
                    'group mx-2 mb-1 cursor-pointer rounded-lg px-3 py-2 transition-colors',
                    activeDocumentId === doc.id
                      ? 'bg-primary-50 text-primary-900'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {doc.title}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        {getStatusIcon(doc.status)}
                        <span className="text-xs text-gray-500">
                          {getStatusLabel(doc.status)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDocument(e, doc.id)}
                      className="rounded p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New Document Button */}
            <div className="border-t p-3">
              <button
                onClick={handleNewDocument}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <Plus className="h-4 w-4" />
                New Document
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <button
              onClick={() => navigate('/')}
              className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </button>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDocument(doc.id)}
                className={cn(
                  'rounded p-2',
                  activeDocumentId === doc.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                )}
                title={doc.title}
              >
                {getStatusIcon(doc.status)}
              </button>
            ))}
            <button
              onClick={handleNewDocument}
              className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="New Document"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
