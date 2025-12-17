import { useState, useEffect } from 'react'
import { Github, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface GitHubInputProps {
  value: string
  onChange: (value: string) => void
  onValidation: (isValid: boolean) => void
  error?: string
  onErrorClear?: () => void
}

// GitHub URL validation regex
const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+(\/)?(\?.*)?$/

export default function GitHubInput({
  value,
  onChange,
  onValidation,
  error,
  onErrorClear,
}: GitHubInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null)

  useEffect(() => {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      setIsValid(false)
      setRepoInfo(null)
      onValidation(false)
      return
    }

    // Check if URL matches GitHub pattern
    const isValidUrl = GITHUB_URL_REGEX.test(trimmedValue)
    setIsValid(isValidUrl)
    onValidation(isValidUrl)

    if (isValidUrl) {
      // Extract owner and repo name
      const match = trimmedValue.match(/github\.com\/([\w-]+)\/([\w.-]+)/)
      if (match) {
        setRepoInfo({
          owner: match[1],
          repo: match[2].replace(/\.git$/, ''),
        })
      }
    } else {
      setRepoInfo(null)
    }
  }, [value, onValidation])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (error && onErrorClear) {
      onErrorClear()
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative flex items-center rounded-lg border-2 bg-white transition-all',
          isFocused
            ? 'border-primary-500 ring-2 ring-primary-100'
            : error
              ? 'border-red-300'
              : isValid && value
                ? 'border-green-300'
                : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <div className="flex items-center pl-4">
          <Github className={cn(
            'h-5 w-5',
            isFocused ? 'text-primary-500' : 'text-gray-400'
          )} />
        </div>
        <input
          type="url"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="https://github.com/username/repository"
          className="flex-1 border-0 bg-transparent px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
        />
        {value && (
          <div className="flex items-center pr-4">
            {isValid ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Valid repo info */}
      {isValid && repoInfo && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-800">
            Repository: <strong>{repoInfo.owner}/{repoInfo.repo}</strong>
          </span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-green-700 hover:text-green-900"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs">View</span>
          </a>
        </div>
      )}

      {/* Helper text */}
      {!value && !error && (
        <p className="text-xs text-gray-500">
          Supports public and private repositories. For private repos, ensure you have access configured.
        </p>
      )}
    </div>
  )
}
