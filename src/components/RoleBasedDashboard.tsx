import useAuth from "@/modules/Auth/hooks/useAuth";
import { Navigate } from "react-router";
import { AdminDashboard } from "@/modules/Dashboard";
import { CapatazDashboard } from "@/modules/Dashboard";

/**
 * Componente que renderiza el dashboard correspondiente según el rol del usuario
 * 
 * Lógica de ruteo:
 * - ADMIN → AdminDashboard (métricas globales: campos, órdenes, compras, ventas)
 * - CAPATAZ → CapatazDashboard (métricas de sus campos asignados, sin ventas/compras)
 * - OPERARIO → Redirige a /my-tasks
 * - Sin rol válido → Redirige a login
 */
export function RoleBasedDashboard() {
  const auth = useAuth();
  
  // Si no está autenticado, redirigir a login
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = auth.accessPayload?.role;

  // Ruteo basado en rol
  switch (userRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    
    case 'CAPATAZ':
      return <CapatazDashboard />;
    
    case 'OPERARIO':
      return <Navigate to="/my-tasks" replace />;
    
    default:
      // Si no tiene un rol válido, redirigir a login
      return <Navigate to="/login" replace />;
  }
}
