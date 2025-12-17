import { useCallback, useState } from 'react'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

export default function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && isValidFile(file)) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && isValidFile(file)) {
      onFileSelect(file)
    }
  }

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.zip', '.tar.gz', '.tgz', '.tar']
    return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (selectedFile) {
    return (
      <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
        isDragging
          ? 'border-primary-400 bg-primary-50'
          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        className="hidden"
        accept=".zip,.tar.gz,.tgz,.tar"
        onChange={handleFileInput}
      />
      <Upload className="h-10 w-10 text-gray-400" />
      <p className="mt-4 text-sm font-medium text-gray-700">
        Drop your codebase here or click to browse
      </p>
      <p className="mt-1 text-xs text-gray-500">Supports .zip, .tar.gz, .tgz, .tar (max 50MB)</p>
    </label>
  )
}
