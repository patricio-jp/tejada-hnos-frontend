import type { ReactElement } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const auth = useAuth()
  const authed = auth.isAuthenticated
  // If token expired while mounted, redirect to login
  if (!authed) {
    return <Navigate to="/login" replace />
  }
  return children
}
