import { LoginForm } from "@/components/login-form"
import { ThemeProvider } from "@/lib/theme"
import useAuth from "@/modules/Auth/hooks/useAuth"
import { Navigate } from "react-router"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  // Si el usuario ya está autenticado, redirigir a la página principal
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

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
