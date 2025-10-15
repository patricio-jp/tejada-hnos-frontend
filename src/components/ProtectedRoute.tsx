import useAuth from "@/modules/Auth/hooks/useAuth"
import { Navigate } from "react-router"

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const auth = useAuth()
  const authed = auth.isAuthenticated
  // If token expired while mounted, redirect to login
  if (!authed) {
    return <Navigate to="/login" replace />
  }
  return children
}
