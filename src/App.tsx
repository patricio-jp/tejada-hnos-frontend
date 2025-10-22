import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router'
import LoginPage from '@/modules/Auth/pages/login'


function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="mt-2">Welcome to the app. Use the navigation to try routes.</p>
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

const PaginaCargando = () => (
  <div className="container mx-auto py-10">Cargando...</div>
);
const CamposPage = React.lazy(() => import('./modules/Fields/pages/FieldsPage'));
const ParcelaPage = React.lazy(() => import('./modules/Plots/pages/PlotsPage'));

import { ThemeProvider } from '@/lib/theme'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from './components/layout/layout'
import MapExample from './common/components/MapExample'


export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <Protected />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Suspense fallback={<PaginaCargando />}>
          <Routes>
            {/* Ruta para la lista de campos */}
            <Route path="/fields" element={<CamposPage />} />
            
            {/* Ruta para el editor de parcelas */}
            <Route path="/fields/:fieldId" element={<ParcelaPage />} />
          </Routes>
        </Suspense>
    </Layout>
  </ThemeProvider>
  )
}
