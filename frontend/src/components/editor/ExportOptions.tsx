import { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import Button from '@/components/common/Button'
import { generationApi } from '@/api/sections'
import { storage } from '@/utils/storage'

interface ExportOptionsProps {
  documentId: string
  documentTitle: string
}

export default function ExportOptions({ documentId, documentTitle }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (format: 'markdown' | 'docx' | 'pdf') => {
    setIsExporting(format)

    try {
      const url = generationApi.exportDocument(documentId, format)
      const token = storage.getToken()

      // Create a fetch request with auth header
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${documentTitle}.${format === 'markdown' ? 'md' : format}`
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-medium text-gray-900">Export Document</h3>
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleExport('markdown')}
          isLoading={isExporting === 'markdown'}
        >
          <FileText className="mr-2 h-4 w-4" />
          Markdown (.md)
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleExport('docx')}
          isLoading={isExporting === 'docx'}
        >
          <File className="mr-2 h-4 w-4" />
          Word (.docx)
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleExport('pdf')}
          isLoading={isExporting === 'pdf'}
        >
          <Download className="mr-2 h-4 w-4" />
          PDF (.pdf)
        </Button>
      </div>
    </div>
  )
}
