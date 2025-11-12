import useAuth from "@/modules/Auth/hooks/useAuth";
import { Navigate } from "react-router";

interface OperarioRouteProps {
  children: React.ReactElement;
}

/**
 * Componente para proteger rutas que solo pueden ser accedidas por operarios
 * Verifica que el usuario esté autenticado Y tenga el rol OPERARIO
 */
export function OperarioRoute({ children }: OperarioRouteProps) {
  const auth = useAuth();
  const authed = auth.isAuthenticated;
  
  // Si no está autenticado, redirigir a login
  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  // Verificar el rol del usuario desde el payload del token
  const userRole = auth.accessPayload?.role;
  
  // Si no es OPERARIO, redirigir a dashboard
  if (userRole !== 'OPERARIO') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
