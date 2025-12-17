import { Link } from 'react-router-dom'
import { FileText, Trash2, MoreVertical, Edit, Eye } from 'lucide-react'
import { useState } from 'react'
import { formatDate, getStatusColor, getStatusLabel } from '@/utils/helpers'
import type { Document } from '@/types'
import Button from '@/components/common/Button'

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => void
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getActionLink = () => {
    switch (document.status) {
      case 'draft':
        return `/documents/${document.id}/review`
      case 'sections_approved':
      case 'generating':
      case 'completed':
        return `/documents/${document.id}/edit`
      default:
        return `/documents/${document.id}/edit`
    }
  }

  return (
    <div className="group relative rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <Link
              to={getActionLink()}
              className="font-semibold text-gray-900 hover:text-primary-600"
            >
              {document.title}
            </Link>
            <p className="text-xs text-gray-500">{formatDate(document.updated_at)}</p>
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
                    onDelete(document.id)
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

      <div className="mb-4">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(document.status)}`}>
          {getStatusLabel(document.status)}
        </span>
      </div>

      <div className="flex gap-2">
        {document.status === 'draft' ? (
          <Link to={`/documents/${document.id}/review`}>
            <Button size="sm">
              <Edit className="mr-1 h-3 w-3" />
              Review Sections
            </Button>
          </Link>
        ) : (
          <Link to={`/documents/${document.id}/edit`}>
            <Button size="sm">
              <Eye className="mr-1 h-3 w-3" />
              View Document
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
