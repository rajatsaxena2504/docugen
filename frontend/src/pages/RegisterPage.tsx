import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-600">DocuGen</h1>
          <p className="mt-2 text-gray-600">AI-powered documentation generator</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Create your account</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
