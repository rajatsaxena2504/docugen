import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Github } from 'lucide-react'
import Layout from '@/components/common/Layout'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import FileUpload from '@/components/projects/FileUpload'
import GitHubConnect from '@/components/projects/GitHubConnect'
import { useCreateProject, useCreateGitHubProject } from '@/hooks/useProjects'
import { cn } from '@/utils/helpers'

type SourceType = 'upload' | 'github'

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [sourceType, setSourceType] = useState<SourceType>('upload')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const createProject = useCreateProject()
  const createGitHubProject = useCreateGitHubProject()

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    if (description) formData.append('description', description)

    createProject.mutate(formData, {
      onSuccess: (project) => {
        navigate(`/projects/${project.id}`)
      },
    })
  }

  const handleGitHubSubmit = (url: string) => {
    createGitHubProject.mutate(
      { github_url: url, name: name || undefined, description: description || undefined },
      {
        onSuccess: (project) => {
          navigate(`/projects/${project.id}`)
        },
      }
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Project</h1>

        {/* Source type tabs */}
        <div className="mb-6 flex rounded-lg border bg-gray-50 p-1">
          <button
            onClick={() => setSourceType('upload')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              sourceType === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>
          <button
            onClick={() => setSourceType('github')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              sourceType === 'github'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        <div className="rounded-xl border bg-white p-6">
          {/* Common fields */}
          <div className="mb-6 space-y-4">
            <Input
              id="name"
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              required={sourceType === 'upload'}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your project..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                rows={3}
              />
            </div>
          </div>

          {/* Source-specific content */}
          {sourceType === 'upload' ? (
            <form onSubmit={handleUploadSubmit}>
              <FileUpload
                selectedFile={file}
                onFileSelect={setFile}
                onClear={() => setFile(null)}
              />
              <Button
                type="submit"
                className="mt-6 w-full"
                isLoading={createProject.isPending}
                disabled={!file || !name}
              >
                Create Project
              </Button>
            </form>
          ) : (
            <GitHubConnect
              onSubmit={handleGitHubSubmit}
              isLoading={createGitHubProject.isPending}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
