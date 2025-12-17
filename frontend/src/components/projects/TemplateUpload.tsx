import { useRef, useState } from 'react'
import { Upload, FileText, X, File, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface TemplateUploadProps {
  file: File | null
  onFileSelect: (file: File) => void
  onFileClear: () => void
}

const ACCEPTED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function TemplateUpload({
  file,
  onFileSelect,
  onFileClear,
}: TemplateUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return 'Only PDF and DOCX files are accepted'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const selectedFile = files[0]
    const validationError = validateFile(selectedFile)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    onFileSelect(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileChange(e.dataTransfer.files)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <File className="h-8 w-8 text-red-500" />
    }
    return <FileText className="h-8 w-8 text-blue-500" />
  }

  if (file) {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-lg bg-white p-2 shadow-sm">
            {getFileIcon(file.type)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Template uploaded</span>
            </div>
            <p className="mt-1 truncate text-sm text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onFileClear}
            className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-xs text-green-700">
          We'll extract sections from this template to structure your documentation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all',
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className={cn(
            'mb-3 rounded-full p-3',
            isDragging ? 'bg-primary-100' : 'bg-gray-200'
          )}>
            <Upload className={cn(
              'h-6 w-6',
              isDragging ? 'text-primary-600' : 'text-gray-500'
            )} />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragging ? 'Drop file here' : 'Drag and drop your template'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            or <span className="text-primary-600">browse</span> to upload
          </p>
          <p className="mt-2 text-xs text-gray-400">
            PDF or DOCX, max 10MB
          </p>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
