import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import type { DocumentSection } from '@/types'

interface SectionEditorProps {
  section: DocumentSection | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: { custom_title?: string; custom_description?: string }) => void
  isLoading?: boolean
}

export default function SectionEditor({
  section,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: SectionEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (section) {
      setTitle(section.custom_title || section.title)
      setDescription(section.custom_description || section.description)
    }
  }, [section])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      custom_title: title !== section?.title ? title : undefined,
      custom_description: description !== section?.description ? description : undefined,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Section" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="section-title"
          label="Section Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter section title"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this section should contain..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={4}
          />
          <p className="mt-1 text-xs text-gray-500">
            This description guides the AI when generating content for this section.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
