// src/components/AdminRoute.tsx

import useAuth from "@/modules/Auth/hooks/useAuth";
import { Navigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

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
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Acceso Restringido</CardTitle>
              <CardDescription className="text-base mt-2">
                Esta función requiere permisos de administrador
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Solo los administradores pueden acceder a esta sección.
                Si necesitas realizar esta acción, contacta a tu administrador.
              </p>
              <Button asChild className="w-full">
                <a href="/dashboard">
                  Volver al Dashboard
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
