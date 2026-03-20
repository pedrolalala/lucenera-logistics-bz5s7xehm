import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useUserRole } from '@/hooks/useUserRole'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Package,
  CheckCircle2,
  Server,
  CalendarDays,
  Settings,
  Clock,
  ArrowRight,
  AlertTriangle,
  MapPin,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboardPage() {
  const { userName } = useUserRole()
  const navigate = useNavigate()
  const now = new Date()

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [usersRes, pendentesRes, entregasRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('entregas_pendentes').select('status_pendencia'),
        supabase
          .from('entregas_finalizadas')
          .select('id', { count: 'exact', head: true })
          .gte('data_entrega_real', new Date(now.getFullYear(), now.getMonth(), 1).toISOString()),
      ])

      const pendentesCount = (pendentesRes.data || []).filter(
        (p: any) =>
          !p.status_pendencia ||
          ['aguardando_resolucao', 'pendente', 'em_analise'].includes(p.status_pendencia),
      ).length

      return {
        users: usersRes.count || 0,
        pendentes: pendentesCount,
        entregas: entregasRes.count || 0,
      }
    },
  })

  const { data: pendentesCriticas } = useQuery({
    queryKey: ['admin-pendentes-criticas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('entregas_pendentes')
        .select('*')
        .in('status_pendencia', ['aguardando_resolucao', 'pendente', 'em_analise'])
        .order('created_at', { ascending: false })
        .limit(5)
      return data || []
    },
  })

  const { data: recentActivities } = useQuery({
    queryKey: ['admin-recent-activities'],
    queryFn: async () => {
      const { data: separacoes } = await supabase
        .from('separacoes')
        .select('id, cliente, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5)
      const { data: entregas } = await supabase
        .from('entregas_finalizadas')
        .select('id, cliente, data_entrega_real')
        .order('data_entrega_real', { ascending: false })
        .limit(5)

      const activities = [
        ...(separacoes?.map((s) => ({
          type: 'separacao',
          message: `Separação criada: ${s.cliente}`,
          timestamp: new Date(s.created_at),
          icon: Package,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
        })) || []),
        ...(entregas?.map((e) => ({
          type: 'entrega',
          message: `Entrega finalizada: ${e.cliente}`,
          timestamp: new Date(e.data_entrega_real),
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
        })) || []),
      ]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 6)

      return activities
    },
  })

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Agora'
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? 's' : ''}`
    return format(date, "dd/MM 'às' HH:mm")
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-700">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao Painel Administrativo, {userName}</p>
        <p className="text-sm text-muted-foreground">
          {format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-purple-500"
          onClick={() => navigate('/admin/usuarios')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Usuários Ativos</p>
                <p className="text-4xl font-bold text-purple-700">{stats?.users ?? '-'}</p>
                <p className="text-xs text-purple-600 mt-2 flex items-center gap-1 hover:underline">
                  Gerenciar equipe <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-red-500"
          onClick={() => navigate('/pendentes')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Entregas Pendentes</p>
                <p className="text-4xl font-bold text-red-600">{stats?.pendentes ?? '-'}</p>
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1 hover:underline">
                  Ações requeridas <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Entregas do Mês</p>
                <p className="text-4xl font-bold text-green-600">{stats?.entregas ?? '-'}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(now, 'MMMM', { locale: ptBR })}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-gray-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-2">Status do Sistema</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xl font-bold text-gray-700">Online</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Uptime: 99.9%</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Server className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-red-500 shadow-md">
            <CardHeader className="border-b border-border bg-red-50/50 pb-4">
              <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    Painel de Pendências Logísticas
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Entregas com problemas que necessitam de intervenção administrativa imediata
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pendentes')}
                  className="text-red-700 border-red-200 hover:bg-red-50"
                >
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {pendentesCriticas?.map((p) => (
                  <div key={p.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-foreground">#{p.codigo_obra}</span>
                          <span className="font-semibold text-foreground">{p.cliente}</span>
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-2 py-0.5 ml-2 uppercase"
                          >
                            {p.tipo_problema?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 border-l-2 border-red-300 pl-3">
                          {p.descricao_problema}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {p.endereco && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[250px]">{p.endereco}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-medium text-red-600">
                            <Clock className="w-3.5 h-3.5" />
                            Registrado em{' '}
                            {p.created_at ? format(new Date(p.created_at), "dd/MM 'às' HH:mm") : ''}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="shrink-0 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => navigate('/pendentes')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Analisar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendentesCriticas?.length === 0 && (
                  <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      Nenhuma pendência crítica!
                    </p>
                    <p className="text-sm mt-1">
                      O fluxo operacional está ocorrendo sem bloqueios.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate('/admin/usuarios')}
                  className="h-24 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-semibold whitespace-normal text-center leading-tight">
                    Gerenciar Equipe
                  </span>
                </Button>
                <Button
                  onClick={() => navigate('/separacao')}
                  className="h-24 flex flex-col gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm"
                >
                  <Package className="w-6 h-6" />
                  <span className="text-xs font-semibold whitespace-normal text-center leading-tight">
                    Painel Operacional
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/calendario')}
                  className="h-24 flex flex-col gap-2 bg-card hover:bg-muted border-2 rounded-xl"
                >
                  <CalendarDays className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs font-semibold whitespace-normal text-center leading-tight text-foreground">
                    Ver Calendário
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/configuracoes')}
                  className="h-24 flex flex-col gap-2 bg-card hover:bg-muted border-2 rounded-xl"
                >
                  <Settings className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs font-semibold whitespace-normal text-center leading-tight text-foreground">
                    Configurações
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivities?.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bgColor} ${act.color}`}
                    >
                      <act.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{act.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTimeAgo(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivities?.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma atividade recente.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
