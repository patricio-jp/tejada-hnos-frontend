import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'


function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Bienvenido al panel principal.</p>
    </div>
  )
}

function About() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">About</h1>
      <p className="mt-2">This is an example route implemented with React Router.</p>
    </div>
  )
}

function Protected() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Protected</h1>
      <p className="mt-2">You can see this because you're authenticated.</p>
      <MapExample />
    </div>
  )
}

function NotFound() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Not found</h1>
      <p className="mt-2">The page you're looking for doesn't exist.</p>
    </div>
  )
}

function PaginaNoImplementada() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Página no implementada</h1>
      <p className="mt-2">Esta página aún no ha sido implementada.</p>
    </div>
  )
}

const PaginaCargando = () => (
  <div className="container mx-auto py-10">Cargando...</div>
);

/**
 * Carga diferida (lazy loading) de las páginas
 * Para optimizar el rendimiento de la aplicación
 */
const CamposPage = React.lazy(() => import('./modules/Fields/pages/FieldsPage'));
const ParcelaPage = React.lazy(() => import('./modules/Plots/pages/PlotsPage'));
const ActivitiesDashboard = React.lazy(() => import('./modules/Activities/pages/ActivitiesDashboard'));
const ActivitiesListPage = React.lazy(() => import('./modules/Activities/pages/ActivitiesListPage'));
const PurchaseOrdersListPage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrdersListPage'));
const PurchaseOrderFormPage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrderFormPage'));
const PurchaseOrderApprovalPage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrderApprovalPage'));
const PurchaseOrderClosurePage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrderClosurePage'));
const InputsInventoryPage = React.lazy(() => import('./modules/Inputs/pages/InputsInventoryPage'));

// Páginas de catálogos
const SuppliersPage = React.lazy(() => import('./modules/Suppliers/pages/SuppliersPage'));
const CustomersPage = React.lazy(() => import('./modules/Customers/pages/CustomersPage'));
const VarietiesPage = React.lazy(() => import('./modules/Varieties/pages/VarietiesPage'));

import { ThemeProvider } from '@/lib/theme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { Layout } from './components/layout/layout'
import MapExample from './common/components/MapExample'
import { Toaster } from '@/components/ui/sonner'


export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      {/* Rutas protegidas por autenticación */}
      <ProtectedRoute>
        <Layout>
          {/* Suspense para carga diferida (lazy loading) */}
          <Suspense fallback={<PaginaCargando />}>
            <Routes>
              <Route path="" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="about" element={<About />} />
              <Route path="protected" element={<Protected />}/>
              {/* Ruta para la lista de campos */}
              <Route path="fields">
                <Route index element={<CamposPage />} />
                <Route path="list" element={<PaginaNoImplementada />} />
                {/* Ruta para el editor de parcelas */}
                <Route path=":fieldId" element={<ParcelaPage />} />
              </Route>

              {/* Rutas de Actividades */}
              <Route path="activities">
                <Route index element={<ActivitiesDashboard />} />
                <Route path="list" element={<ActivitiesListPage />} />
              </Route>

              {/* Rutas de Catálogos */}
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="varieties" element={<VarietiesPage />} />
              <Route path="inputs" element={<InputsInventoryPage />} />
              {/* Rutas de Órdenes de Compra */}
              <Route path="purchases">
                <Route index element={<PurchaseOrdersListPage />} />
                <Route path="new" element={<PurchaseOrderFormPage />} />
                <Route path="edit/:id" element={<PurchaseOrderFormPage />} />
                {/* Ruta de aprobación solo para ADMIN */}
                <Route 
                  path="approvals" 
                  element={
                    <AdminRoute>
                      <PurchaseOrderApprovalPage />
                    </AdminRoute>
                  } 
                />
                {/* Ruta de cierre solo para ADMIN */}
                <Route 
                  path="closure" 
                  element={
                    <AdminRoute>
                      <PurchaseOrderClosurePage />
                    </AdminRoute>
                  } 
                />
              </Route>

              <Route path="reports" element={<PaginaNoImplementada />} />
              <Route path="users" element={<PaginaNoImplementada />} />
              <Route path="settings" element={<PaginaNoImplementada />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
      </Layout>
    </ProtectedRoute>
    <Toaster />
  </ThemeProvider>
  )
}
