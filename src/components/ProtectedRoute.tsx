import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Simplemente esperar un momento y confiar en isAuthenticated
    const timer = setTimeout(() => {
      setChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Si cambia el estado de autenticación, actualizar inmediatamente
  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false)
    }
  }, [isAuthenticated])

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-muted-foreground">Verificando sesión...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
