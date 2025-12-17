import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  FileText,
  Code,
  BookOpen,
  Settings,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react'
import Button from '@/components/common/Button'
import { templatesApi } from '@/api/sections'
import { documentsApi } from '@/api/documents'
import { useSession } from '@/context/SessionContext'
import type { DocumentType } from '@/types'
import { cn } from '@/utils/helpers'

// Template icons mapping
const templateIcons: Record<string, React.ReactNode> = {
  'Requirements Document': <FileText className="h-8 w-8" />,
  'Design Document': <Settings className="h-8 w-8" />,
  'Technical Specification': <Code className="h-8 w-8" />,
  'Technical Specification Document': <Code className="h-8 w-8" />,
  'API Documentation': <FileCode className="h-8 w-8" />,
  'User Guide': <BookOpen className="h-8 w-8" />,
  'README': <FileText className="h-8 w-8" />,
  'Developer Guide': <Code className="h-8 w-8" />,
}

// Template descriptions for display
const templateDescriptions: Record<string, string> = {
  'Requirements Document': 'Define project requirements, user stories, and acceptance criteria',
  'Design Document': 'Document system design, architecture decisions, and component interactions',
  'Technical Specification': 'Detailed technical specs including APIs, data models, and algorithms',
  'Technical Specification Document': 'Detailed technical specs including APIs, data models, and algorithms',
  'API Documentation': 'Document REST/GraphQL APIs with endpoints, parameters, and examples',
  'User Guide': 'End-user documentation with tutorials, features, and troubleshooting',
  'README': 'Project overview, setup instructions, and quick start guide',
  'Developer Guide': 'Guide for developers contributing to the project',
}

export default function TemplateSelectionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { updateDocument, getDocument } = useSession()

  // Get projectId and documentId from navigation state
  const { projectId, documentId } = (location.state as {
    projectId?: string
    documentId?: string
  }) || {}

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.list,
  })

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!projectId) throw new Error('Project ID is required')

      const template = templates?.find(t => t.id === templateId)
      const document = await documentsApi.create({
        project_id: projectId,
        document_type_id: templateId,
        title: `${template?.name || 'Documentation'} - ${new Date().toLocaleDateString()}`,
      })

      return { document, template }
    },
    onSuccess: ({ document, template }) => {
      // Update session document
      if (documentId) {
        updateDocument(documentId, {
          templateId: document.document_type_id || undefined,
          templateName: template?.name,
          title: document.title,
          status: 'ready',
        })
      }

      toast.success('Template selected! Let\'s configure sections.')
      navigate(`/documents/${document.id}/review`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create document')
    },
  })

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
  }

  const handleContinue = () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template')
      return
    }
    createDocumentMutation.mutate(selectedTemplateId)
  }

  const handleBack = () => {
    navigate('/')
  }

  // Redirect if no project context
  useEffect(() => {
    if (!projectId) {
      toast.error('Please start by entering a GitHub repository')
      navigate('/')
    }
  }, [projectId, navigate])

  if (templatesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600" />
          <p className="mt-2 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to repository input
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Choose a Template</h1>
          <p className="mt-2 text-gray-600">
            Select a documentation template that best fits your project needs.
            We'll suggest relevant sections based on your codebase.
          </p>
        </div>

        {/* Template Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => handleSelectTemplate(template.id)}
            />
          ))}
        </div>

        {/* Selected Template Info */}
        {selectedTemplateId && (
          <div className="mb-8 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-primary-900">
                Selected: {templates?.find(t => t.id === selectedTemplateId)?.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-primary-700">
              Click "Continue" to proceed with section configuration
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplateId || createDocumentMutation.isPending}
            isLoading={createDocumentMutation.isPending}
          >
            Continue to Section Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: DocumentType
  isSelected: boolean
  onSelect: () => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const icon = templateIcons[template.name] || <FileText className="h-8 w-8" />
  const description = templateDescriptions[template.name] || template.description || 'Documentation template'

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-start rounded-xl border-2 bg-white p-6 text-left transition-all hover:shadow-md',
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-100'
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 rounded-full bg-primary-500 p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'mb-4 rounded-lg p-3',
        isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
      )}>
        {icon}
      </div>

      {/* Content */}
      <h3 className={cn(
        'mb-2 font-semibold',
        isSelected ? 'text-primary-900' : 'text-gray-900'
      )}>
        {template.name}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2">
        {description}
      </p>

      {/* System badge */}
      {template.is_system && (
        <span className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          Built-in
        </span>
      )}
    </button>
  )
}
