import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { useSections } from '@/hooks/useSections'
import { cn } from '@/utils/helpers'
import type { Section } from '@/types'

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { section_id?: string; custom_title?: string; custom_description?: string }) => void
  existingSectionIds: string[]
}

export default function AddSectionModal({
  isOpen,
  onClose,
  onAdd,
  existingSectionIds,
}: AddSectionModalProps) {
  const [mode, setMode] = useState<'library' | 'custom'>('library')
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  const { data: sections } = useSections()

  const availableSections = sections?.filter((s) => !existingSectionIds.includes(s.id)) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'library' && selectedSection) {
      onAdd({ section_id: selectedSection.id })
    } else if (mode === 'custom' && customTitle && customDescription) {
      onAdd({ custom_title: customTitle, custom_description: customDescription })
    }

    // Reset form
    setSelectedSection(null)
    setCustomTitle('')
    setCustomDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Section" size="lg">
      <div className="mb-4 flex rounded-lg border bg-gray-50 p-1">
        <button
          onClick={() => setMode('library')}
          className={cn(
            'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'library' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          )}
        >
          From Library
        </button>
        <button
          onClick={() => setMode('custom')}
          className={cn(
            'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          )}
        >
          Custom Section
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'library' ? (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {availableSections.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                All available sections have been added
              </p>
            ) : (
              availableSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedSection(section)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-all',
                    selectedSection?.id === section.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium text-gray-900">{section.name}</p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{section.description}</p>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              id="custom-title"
              label="Section Title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Performance Benchmarks"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Description
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Describe what this section should contain..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                rows={3}
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              (mode === 'library' && !selectedSection) ||
              (mode === 'custom' && (!customTitle || !customDescription))
            }
          >
            Add Section
          </Button>
        </div>
      </form>
    </Modal>
  )
}
