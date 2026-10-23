import { Suspense, lazy } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { EntregadorRoute } from '@/components/auth/EntregadorRoute'
import { SmartRedirect } from '@/components/auth/SmartRedirect'

// SPEC-123: code-splitting por rota (mesmo padrão já em produção no RH,
// dashboard-rh-lucenera-5fe9c/src/App.tsx).
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const SeparacaoPage = lazy(() => import('./pages/SeparacaoPage'))
const CalendarioPage = lazy(() => import('./pages/CalendarioPage'))
const RegistrarEntregaPage = lazy(() => import('./pages/RegistrarEntregaPage'))
const EntregasFinalizadasPage = lazy(() => import('./pages/EntregasFinalizadasPage'))
const PendentesPage = lazy(() => import('./pages/PendentesPage'))
const RouteOptimizerPage = lazy(() => import('./pages/RouteOptimizerPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))
const AdminDevPage = lazy(() => import('./pages/admin/AdminDevPage'))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'))
const AdminMetricasPage = lazy(() => import('./pages/admin/AdminMetricasPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient()

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Carregando...</div>
  </div>
)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <SmartRedirect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/separacao"
                element={
                  <EntregadorRoute>
                    <SeparacaoPage />
                  </EntregadorRoute>
                }
              />
              <Route
                path="/calendario"
                element={
                  <EntregadorRoute>
                    <CalendarioPage />
                  </EntregadorRoute>
                }
              />
              <Route
                path="/pendentes"
                element={
                  <EntregadorRoute>
                    <PendentesPage />
                  </EntregadorRoute>
                }
              />
              <Route
                path="/registrar-entrega"
                element={
                  <ProtectedRoute>
                    <RegistrarEntregaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entregas-finalizadas"
                element={
                  <ProtectedRoute>
                    <EntregasFinalizadasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/otimizar-rota"
                element={
                  <ProtectedRoute>
                    <RouteOptimizerPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/configuracoes"
                element={
                  <AdminRoute>
                    <AdminSettingsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/desenvolvimento"
                element={
                  <AdminRoute>
                    <AdminDevPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/metricas"
                element={
                  <AdminRoute>
                    <AdminMetricasPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <AdminRoute>
                    <AdminLogsPage />
                  </AdminRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
