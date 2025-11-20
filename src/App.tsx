import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

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
const FieldsTestPage = React.lazy(() => import('./modules/Fields/pages/FieldsTestPage'));
const FieldsListPage = React.lazy(() => import('./modules/Fields/pages/FieldsListPage'));
const ParcelaPage = React.lazy(() => import('./modules/Plots/pages/PlotsPage'));
const PlotsListPage = React.lazy(() => import('./modules/Plots/pages/PlotsListPage'));
const PurchaseOrdersListPage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrdersListPage'));
const PurchaseOrderFormPage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrderFormPage'));
const PurchaseOrderApprovalPage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrderApprovalPage'));
const PurchaseOrderClosurePage = React.lazy(() => import('./modules/Purchases/pages/PurchaseOrderClosurePage'));
const OrdersToShipPage = React.lazy(() => import('./modules/Shipments/pages/OrdersToShipPage'));
const ShipmentWizardPage = React.lazy(() => import('./modules/Shipments/pages/ShipmentWizardPage'));
const InputsInventoryPage = React.lazy(() => import('./modules/Inputs/pages/InputsInventoryPage'));
const HarvestingPage = React.lazy(() => import('./modules/Harvesting/pages/HarvestingPage'));
const PlotReportPage = React.lazy(() => import('./modules/Reports/pages/PlotReportPage'))
const OrdersToShipPage = React.lazy(() => import('./modules/Shipments/pages/OrdersToShipPage'));
const ShipmentWizardPage = React.lazy(() => import('./modules/Shipments/pages/ShipmentWizardPage'));

// Páginas de catálogos
const SuppliersPage = React.lazy(() => import('./modules/Suppliers/pages/SuppliersPage'))
const CustomersPage = React.lazy(() => import('./modules/Customers/pages/CustomersPage'))
const VarietiesPage = React.lazy(() => import('./modules/Varieties/pages/VarietiesPage'))

// Páginas de WorkOrders (Operarios)
const MyTasksPage = React.lazy(() => import('./modules/WorkOrders/pages/MyTasksPage'))
const WorkOrdersPage = React.lazy(() => import('./modules/WorkOrders/pages/WorkOrdersPage'))
const WorkOrderFormPage = React.lazy(() => import('./modules/WorkOrders/pages/WorkOrderFormPage'))
const WorkOrderDetailPage = React.lazy(() => import('./modules/WorkOrders/pages/WorkOrderDetailPage'));
const SalesOrdersPage = React.lazy(() => import('./modules/SalesOrders/pages/SalesOrdersPage'));
const SalesOrderFormPage = React.lazy(() => import('./modules/SalesOrders/pages/SalesOrderFormPage'));
const ReportsPage = React.lazy(() => import('./modules/Reports/pages/PlotReportPage'));

import { ThemeProvider } from '@/lib/theme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { AdminCapatazRoute } from '@/components/AdminCapatazRoute'
import { OperarioRoute } from '@/components/OperarioRoute'
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard'
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
              
              {/* Dashboard con ruteo por rol */}
              <Route path="dashboard" element={<RoleBasedDashboard />} />
              
              {/* Rutas de operarios */}
              <Route 
                path="my-tasks" 
                element={
                  <OperarioRoute>
                    <MyTasksPage />
                  </OperarioRoute>
                } 
              />
              
              {/* Rutas de WorkOrders - Accesible para todos los roles autenticados */}
              <Route path="work-orders">
                {/* Índice de work-orders - Admin/Capataz */}
                <Route 
                  index 
                  element={
                    <AdminCapatazRoute>
                      <WorkOrdersPage />
                    </AdminCapatazRoute>
                  } 
                />
                {/* Nueva orden de trabajo */}
                <Route 
                  path="new" 
                  element={
                    <AdminCapatazRoute>
                      <WorkOrderFormPage />
                    </AdminCapatazRoute>
                  } 
                />
                {/* Editar orden de trabajo */}
                <Route 
                  path="edit/:id" 
                  element={
                    <AdminCapatazRoute>
                      <WorkOrderFormPage />
                    </AdminCapatazRoute>
                  } 
                />
                {/* Tareas del operario */}
                <Route 
                  path="my-tasks" 
                  element={
                    <OperarioRoute>
                      <MyTasksPage />
                    </OperarioRoute>
                  } 
                />
                {/* Detalle de orden de trabajo */}
                <Route 
                  path=":id" 
                  element={<WorkOrderDetailPage />} 
                />
              </Route>
              
              <Route path="about" element={<About />} />
              <Route path="protected" element={<Protected />}/>
              {/* Ruta para la lista de campos - Solo Admin/Capataz */}
              <Route path="fields">
                <Route 
                  index 
                  element={
                    <AdminCapatazRoute>
                      <CamposPage />
                    </AdminCapatazRoute>
                  } 
                />
                <Route 
                  path="list" 
                  element={
                    <AdminCapatazRoute>
                      <FieldsListPage />
                    </AdminCapatazRoute>
                  }
                />
                {/* Ruta para la lista de parcelas - Solo Admin/Capataz */} 
                  <Route 
                  path="plots-list" 
                  element={
                    <AdminCapatazRoute>
                      <PlotsListPage />
                    </AdminCapatazRoute>
                  }
                />
                {/* Ruta de pruebas de API */}
                <Route 
                  path="test" 
                  element={
                    <AdminCapatazRoute>
                      <FieldsTestPage />
                    </AdminCapatazRoute>
                  } 
                />
                {/* Ruta para el editor de parcelas */}
                <Route 
                  path=":fieldId" 
                  element={
                    <AdminCapatazRoute>
                      <ParcelaPage />
                    </AdminCapatazRoute>
                  } 
                />
              </Route>

              {/* Rutas de Catálogos - Solo Admin/Capataz */}
              <Route 
                path="suppliers" 
                element={
                  <AdminCapatazRoute>
                    <SuppliersPage />
                  </AdminCapatazRoute>
                } 
              />
              <Route 
                path="customers" 
                element={
                  <AdminCapatazRoute>
                    <CustomersPage />
                  </AdminCapatazRoute>
                } 
              />
              <Route 
                path="varieties" 
                element={
                  <AdminCapatazRoute>
                    <VarietiesPage />
                  </AdminCapatazRoute>
                } 
              />
              <Route 
                path="inputs" 
                element={
                  <AdminCapatazRoute>
                    <InputsInventoryPage />
                  </AdminCapatazRoute>
                } 
              />
              <Route 
                path="harvesting" 
                element={
                  <AdminCapatazRoute>
                    <HarvestingPage />
                  </AdminCapatazRoute>
                } 
              />
              {/* Rutas de Envíos / Logística */}
              <Route path="shipments">
                <Route 
                  index // Esto maneja "/shipments"
                  element={
                    <AdminCapatazRoute>
                      <OrdersToShipPage />
                    </AdminCapatazRoute>
                  } 
                />
                {/* Aquí agregaremos la ruta de picking en la Fase 3 */}
                <Route 
                  path="picking/:orderId" 
                  element={
                    <AdminCapatazRoute>
                      <ShipmentWizardPage />
                    </AdminCapatazRoute>
                  } 
                />
              </Route>

              {/* Rutas de Órdenes de Compra - Admin/Capataz para crear/editar, solo Admin para aprobar/cerrar */}
              <Route path="purchases">
                <Route 
                  index 
                  element={
                    <AdminCapatazRoute>
                      <PurchaseOrdersListPage />
                    </AdminCapatazRoute>
                  } 
                />
                <Route 
                  path="new" 
                  element={
                    <AdminCapatazRoute>
                      <PurchaseOrderFormPage />
                    </AdminCapatazRoute>
                  } 
                />
                <Route 
                  path="edit/:id" 
                  element={
                    <AdminCapatazRoute>
                      <PurchaseOrderFormPage />
                    </AdminCapatazRoute>
                  } 
                />
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

              <Route path="sales-orders">
                <Route
                  index
                  element={
                    <AdminCapatazRoute>
                      <SalesOrdersPage />
                    </AdminCapatazRoute>
                  }
                />
                <Route
                  path="new"
                  element={
                    <AdminCapatazRoute>
                      <SalesOrderFormPage />
                    </AdminCapatazRoute>
                  }
                />
              </Route>

              {/* Rutas administrativas - Solo Admin/Capataz */}
              <Route path="reports">
                <Route 
                  index 
                  element={
                    <AdminCapatazRoute>
                      <ReportsPage />
                    </AdminCapatazRoute>
                  } 
                />
                <Route 
                  path="plot/:id" 
                  element={
                    <AdminCapatazRoute>
                      <PlotReportPage />
                    </AdminCapatazRoute>
                  } 
                />
              </Route>
              <Route 
                path="users" 
                element={
                  <AdminCapatazRoute>
                    <PaginaNoImplementada />
                  </AdminCapatazRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <AdminCapatazRoute>
                    <PaginaNoImplementada />
                  </AdminCapatazRoute>
                } 
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
      </Layout>
    </ProtectedRoute>
    <Toaster />
  </ThemeProvider>
  )
}
