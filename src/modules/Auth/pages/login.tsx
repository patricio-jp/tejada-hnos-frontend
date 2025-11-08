import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { LoginForm } from '@/components/login-form'
import { ThemeProvider } from '@/lib/theme'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </ThemeProvider>
  )
}
