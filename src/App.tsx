import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Separacao from './pages/Separacao'
import Pendentes from './pages/Pendentes'
import Finalizadas from './pages/Finalizadas'
import Registrar from './pages/Registrar'
import Calendario from './pages/Calendario'
import Otimizador from './pages/Otimizador'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/separacao" element={<Separacao />} />
          <Route path="/pendentes" element={<Pendentes />} />
          <Route path="/finalizadas" element={<Finalizadas />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/otimizador" element={<Otimizador />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
