import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  PackageSearch,
  Clock,
  CheckCircle2,
  PlusCircle,
  Calendar as CalendarIcon,
  Map,
  Search,
  Bell,
  Sun,
  Moon,
  User,
} from 'lucide-react'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Separação', url: '/separacao', icon: PackageSearch },
  { title: 'Pendentes', url: '/pendentes', icon: Clock },
  { title: 'Calendário', url: '/calendario', icon: CalendarIcon },
  { title: 'Finalizadas', url: '/finalizadas', icon: CheckCircle2 },
  { title: 'Registrar Entrega', url: '/registrar', icon: PlusCircle },
  { title: 'Route Optimizer', url: '/otimizador', icon: Map },
]

export default function Layout() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const getCurrentPageTitle = () => {
    const item = navItems.find((item) => item.url === location.pathname)
    return item ? item.title : 'Lucenera'
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background animate-fade-in">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="py-6 flex items-center justify-center">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-sidebar-primary group-data-[collapsible=icon]:hidden">
              Lucenera
            </h1>
            <h1 className="font-serif text-xl font-bold tracking-tight text-sidebar-primary hidden group-data-[collapsible=icon]:block">
              L
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="font-sans font-medium">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Operações</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{getCurrentPageTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ID Ex: LCN-492..."
                  className="w-64 rounded-full bg-secondary pl-9 font-mono text-xs focus-visible:ring-1"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full ml-2">
                <User className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in-up">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
