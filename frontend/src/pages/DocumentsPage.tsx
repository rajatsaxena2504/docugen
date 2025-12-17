import Layout from '@/components/common/Layout'
import DocumentList from '@/components/documents/DocumentList'

export default function DocumentsPage() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500">View and manage all your generated documentation</p>
      </div>

      <DocumentList />
    </Layout>
  )
}
