import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  Code2,
  ScrollText,
  ArrowLeft,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: userCount } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
      return count || 0
    },
  })

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Usuários', href: '/admin/usuarios', icon: Users, badge: userCount },
    { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
    {
      label: 'Desenvolvimento',
      href: '/admin/desenvolvimento',
      icon: Code2,
      badgeText: 'DEV',
      badgeColor: 'bg-yellow-500 text-yellow-950',
    },
    { label: 'Logs de Auditoria', href: '/admin/logs', icon: ScrollText },
  ]

  const handleLogout = async () => {
    await signOut()
    toast({ title: 'Até logo!', description: 'Você foi desconectado.' })
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0 fixed h-full z-10">
        <div className="h-32 bg-purple-700 p-6 flex flex-col justify-center text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold text-xl">
              L
            </div>
            <span className="font-bold text-xl tracking-tight">Lucenera</span>
          </div>
          <span className="text-[10px] font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded w-fit uppercase">
            ADMIN PANEL
          </span>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-purple-200 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.badgeText && (
                  <span
                    className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', item.badgeColor)}
                  >
                    {item.badgeText}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => navigate('/separacao')}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao App
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-purple-700 text-white flex items-center justify-between px-4 sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold text-lg">
              L
            </div>
            <span className="font-bold tracking-tight">Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-background z-20 flex flex-col p-4 shadow-xl animate-in fade-in slide-in-from-top-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-2',
                  location.pathname === item.href
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-muted-foreground',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="mt-auto space-y-2 pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => navigate('/separacao')}>
                Voltar ao App
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  )
}
