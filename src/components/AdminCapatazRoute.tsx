import useAuth from "@/modules/Auth/hooks/useAuth";
import { Navigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface AdminCapatazRouteProps {
  children: React.ReactElement;
}

/**
 * Componente para proteger rutas que solo pueden ser accedidas por ADMIN o CAPATAZ
 * Verifica que el usuario esté autenticado Y tenga uno de estos roles
 */
export function AdminCapatazRoute({ children }: AdminCapatazRouteProps) {
  const auth = useAuth();
  const authed = auth.isAuthenticated;
  
  // Si no está autenticado, redirigir a login
  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  // Verificar el rol del usuario desde el payload del token
  const userRole = auth.accessPayload?.role;
  
  // Si es OPERARIO, redirigir a my-tasks
  if (userRole === 'OPERARIO') {
    return <Navigate to="/my-tasks" replace />;
  }

  // Si no es ADMIN ni CAPATAZ, mostrar mensaje de acceso denegado
  if (userRole !== 'ADMIN' && userRole !== 'CAPATAZ') {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
              <CardDescription className="text-base mt-2">
                No tienes permisos para acceder a esta sección
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta página solo está disponible para administradores y capataces.
                Si crees que esto es un error, contacta a tu supervisor.
              </p>
              <Button asChild className="w-full">
                <a href="/my-tasks">
                  Ir a Mis Tareas
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return children;
}
