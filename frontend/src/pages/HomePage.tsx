import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Github, FileUp, ArrowRight, Loader2, FileText, Sparkles } from 'lucide-react'
import Button from '@/components/common/Button'
import GitHubInput from '@/components/projects/GitHubInput'
import TemplateUpload from '@/components/projects/TemplateUpload'
import { projectsApi } from '@/api/projects'
import { useSession } from '@/context/SessionContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { createDocument, setActiveDocument } = useSession()
  const [githubUrl, setGithubUrl] = useState('')
  const [githubError, setGithubError] = useState('')
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [isValidUrl, setIsValidUrl] = useState(false)

  // Create project from GitHub
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      // Create project from GitHub URL
      const project = await projectsApi.createFromGitHub({
        github_url: githubUrl,
        name: extractRepoName(githubUrl),
      })
      return project
    },
    onSuccess: async (project) => {
      // Create a new document in session
      const doc = createDocument({
        projectId: project.id,
        githubUrl: githubUrl,
        templateFile: templateFile || undefined,
        status: 'analyzing',
      })
      setActiveDocument(doc.id)

      // If template was uploaded, go directly to section review
      // Otherwise, go to template selection
      if (templateFile) {
        // TODO: Process template file to extract sections
        toast.success('Project created! Analyzing repository...')
        navigate(`/documents/${doc.id}/review`)
      } else {
        navigate('/select-template', {
          state: {
            projectId: project.id,
            documentId: doc.id
          }
        })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!githubUrl.trim()) {
      setGithubError('GitHub URL is required')
      return
    }

    if (!isValidUrl) {
      setGithubError('Please enter a valid GitHub repository URL')
      return
    }

    createProjectMutation.mutate()
  }

  const extractRepoName = (url: string): string => {
    const match = url.match(/github\.com\/[\w-]+\/([\w.-]+)/)
    return match ? match[1].replace(/\.git$/, '') : 'Untitled Project'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <FileText className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">DocuGen</h1>
          </div>
          <p className="text-lg text-gray-600">
            Generate professional documentation from your codebase using AI
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* GitHub URL Input - Required */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Github className="h-5 w-5 text-gray-700" />
                <label className="text-lg font-semibold text-gray-900">
                  GitHub Repository
                </label>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Required
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-500">
                Enter the URL of your GitHub repository to analyze
              </p>
              <GitHubInput
                value={githubUrl}
                onChange={setGithubUrl}
                onValidation={setIsValidUrl}
                error={githubError}
                onErrorClear={() => setGithubError('')}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">and optionally</span>
              </div>
            </div>

            {/* Template Upload - Optional */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileUp className="h-5 w-5 text-gray-700" />
                <label className="text-lg font-semibold text-gray-900">
                  Upload Template
                </label>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Optional
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-500">
                Upload a PDF or DOCX file as a template. We'll extract sections from it.
                If you skip this, you can choose from predefined templates.
              </p>
              <TemplateUpload
                file={templateFile}
                onFileSelect={setTemplateFile}
                onFileClear={() => setTemplateFile(null)}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={createProjectMutation.isPending}
                disabled={!githubUrl.trim() || createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? (
                  'Processing...'
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {templateFile ? 'Analyze & Continue' : 'Continue to Template Selection'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Github className="h-6 w-6" />}
            title="GitHub Integration"
            description="Directly analyze any public or private GitHub repository"
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Smart Templates"
            description="Choose from predefined templates or upload your own"
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI-Powered"
            description="Claude AI generates contextual documentation from your code"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-3 inline-flex rounded-lg bg-primary-50 p-2 text-primary-600">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
