import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { SessionProvider } from '@/context/SessionContext'
// AUTH DISABLED: ProtectedRoute and PublicRoute no longer needed
// import { PageLoading } from '@/components/common/Loading'

// Pages
// AUTH DISABLED: Login/Register pages commented out
// import LoginPage from '@/pages/LoginPage'
// import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ProjectsPage from '@/pages/ProjectsPage'
import NewProjectPage from '@/pages/NewProjectPage'
import DocumentsPage from '@/pages/DocumentsPage'
import NewDocumentPage from '@/pages/NewDocumentPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import SectionReviewPage from '@/pages/SectionReviewPage'
import DocumentEditorPage from '@/pages/DocumentEditorPage'

// New pages for updated flow
import HomePage from '@/pages/HomePage'
import TemplateSelectionPage from '@/pages/TemplateSelectionPage'
import GenerationProgressPage from '@/pages/GenerationProgressPage'

// AUTH DISABLED: ProtectedRoute wrapper commented out
/*
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoading />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
*/

function AppRoutes() {
  return (
    <Routes>
      {/* AUTH DISABLED: Login/Register routes removed - redirect to home */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Main entry point - GitHub input and template upload */}
      <Route path="/" element={<HomePage />} />

      {/* Template selection (if no template uploaded) */}
      <Route path="/select-template" element={<TemplateSelectionPage />} />

      {/* Generation progress page */}
      <Route path="/documents/:documentId/generating" element={<GenerationProgressPage />} />

      {/* All routes now accessible without authentication */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/new" element={<NewProjectPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
      <Route path="/projects/:projectId/documents/new" element={<NewDocumentPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/documents/new" element={<NewDocumentPage />} />
      <Route path="/documents/:documentId/review" element={<SectionReviewPage />} />
      <Route path="/documents/:documentId/edit" element={<DocumentEditorPage />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </AuthProvider>
  )
}
