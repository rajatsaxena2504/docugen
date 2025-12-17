import { GripVertical, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/helpers'
import type { DocumentSection, SectionSuggestion } from '@/types'

interface SectionCardProps {
  section: DocumentSection | SectionSuggestion
  index: number
  isDragging?: boolean
  onEdit?: () => void
  onRemove?: () => void
  onToggleInclude?: () => void
  dragHandleProps?: Record<string, unknown>
  showRelevance?: boolean
}

export default function SectionCard({
  section,
  index,
  isDragging = false,
  onEdit,
  onRemove,
  onToggleInclude,
  dragHandleProps,
  showRelevance = false,
}: SectionCardProps) {
  const isSuggestion = 'relevance_score' in section
  const isIncluded = isSuggestion || ('is_included' in section && section.is_included)

  const title = isSuggestion ? section.name : section.title
  const description = isSuggestion ? section.description : section.description

  return (
    <div
      className={cn(
        'rounded-lg border bg-white transition-all',
        isDragging && 'shadow-lg ring-2 ring-primary-500',
        !isIncluded && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className="mt-1 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {index + 1}
            </span>
            <h3 className="font-medium text-gray-900 truncate">{title}</h3>
            {showRelevance && isSuggestion && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  section.relevance_score >= 0.8
                    ? 'bg-green-100 text-green-700'
                    : section.relevance_score >= 0.5
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {Math.round(section.relevance_score * 100)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
          {isSuggestion && section.reason && (
            <p className="mt-2 text-xs text-gray-400 italic">{section.reason}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onToggleInclude && (
            <button
              onClick={onToggleInclude}
              className={cn(
                'rounded-lg p-2 transition-colors',
                isIncluded
                  ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
              )}
              title={isIncluded ? 'Exclude section' : 'Include section'}
            >
              {isIncluded ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Edit section"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
