import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import useAuth from '@/modules/Auth/hooks/useAuth'
import { createAuthenticatedClient } from '@/lib/http-client'

/**
 * Hook que proporciona un cliente HTTP autenticado
 * Automáticamente maneja errores 401 redirigiendo al login
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const api = useApiClient()
 *   
 *   const fetchUsers = async () => {
 *     try {
 *       const users = await api.get('/users')
 *       console.log(users)
 *     } catch (error) {
 *       console.error('Error fetching users:', error)
 *     }
 *   }
 *   
 *   return <button onClick={fetchUsers}>Load Users</button>
 * }
 * ```
 */
export function useApiClient() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const client = useMemo(
    () =>
      createAuthenticatedClient(() => {
        // Cuando hay un error 401, cerrar sesión y redirigir al login
        logout()
        navigate('/login', { replace: true })
      }),
    [logout, navigate],
  )

  return client
}
