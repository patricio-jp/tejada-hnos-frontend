// src/components/AdminRoute.tsx

import useAuth from "@/modules/Auth/hooks/useAuth";
import { Navigate } from "react-router";

interface AdminRouteProps {
  children: React.ReactElement;
}

/**
 * Componente para proteger rutas que solo pueden ser accedidas por administradores
 * Verifica que el usuario esté autenticado Y tenga el rol ADMIN
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const auth = useAuth();
  const authed = auth.isAuthenticated;
  
  // Si no está autenticado, redirigir a login
  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  // Verificar el rol del usuario desde el payload del token
  const userRole = auth.accessPayload?.role;
  
  // Si no es ADMIN, redirigir a la página principal o mostrar mensaje
  if (userRole !== 'ADMIN') {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive">Acceso Denegado</h1>
            <p className="text-muted-foreground mt-2">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Esta sección solo está disponible para administradores.
            </p>
          </div>
          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  return children;
}
