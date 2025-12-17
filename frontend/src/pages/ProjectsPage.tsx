import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Layout from '@/components/common/Layout'
import Button from '@/components/common/Button'
import ProjectList from '@/components/projects/ProjectList'

export default function ProjectsPage() {
  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Manage your codebases and create documentation</p>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <ProjectList />
    </Layout>
  )
}
