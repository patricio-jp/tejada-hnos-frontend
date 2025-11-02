import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router'
import LoginPage from '@/modules/Auth/pages/login'
import useAuth from '@/modules/Auth/hooks/useAuth'
import { Button } from '@/components/ui/button'


function Home() {
  const { accessPayload, logout } = useAuth()
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="mt-2">Welcome to the app. Use the navigation to try routes.</p>
      
      {accessPayload && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold mb-2">Sesión Activa</h2>
          <p className="text-sm">
            <strong>Email:</strong> {accessPayload.email || 'N/A'}
          </p>
          <Button onClick={logout} variant="outline" size="sm" className="mt-3">
            Cerrar Sesión
          </Button>
        </div>
      )}
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
  const { accessPayload, logout } = useAuth()
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Protected</h1>
      <p className="mt-2">You can see this because you're authenticated.</p>
      {accessPayload && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <pre className="text-sm">{JSON.stringify(accessPayload, null, 2)}</pre>
          <Button onClick={logout} className="mt-4">
            Cerrar Sesión
          </Button>
        </div>
      )}
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

import { ThemeProvider } from '@/lib/theme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from './components/layout/layout'
import MapExample from './common/components/MapExample'


export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Routes>
        <Route path="login" element={<LoginPage />} />
      </Routes>
      {/* Rutas protegidas por autenticación */}
      <ProtectedRoute>
        <Layout>
          {/* Suspense para carga diferida (lazy loading) */}
          <Suspense fallback={<PaginaCargando />}>
            <Routes>
              <Route path="" element={<Home />} />
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

              <Route path="reports" element={<PaginaNoImplementada />} />
              <Route path="users" element={<PaginaNoImplementada />} />
              <Route path="settings" element={<PaginaNoImplementada />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
      </Layout>
    </ProtectedRoute>
  </ThemeProvider>
  )
}
