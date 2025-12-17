import { useState } from 'react'
import { Github } from 'lucide-react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

interface GitHubConnectProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export default function GitHubConnect({ onSubmit, isLoading }: GitHubConnectProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const validateUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/
    return githubRegex.test(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateUrl(url)) {
      setError('Please enter a valid GitHub repository URL')
      return
    }

    setError('')
    onSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
            <Github className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Connect GitHub Repository</h3>
            <p className="text-sm text-gray-500">Clone a public repository from GitHub</p>
          </div>
        </div>

        <Input
          id="github-url"
          type="url"
          placeholder="https://github.com/username/repository"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          error={error}
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading} disabled={!url}>
        Clone Repository
      </Button>
    </form>
  )
}
