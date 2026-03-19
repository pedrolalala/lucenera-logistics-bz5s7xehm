import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Package,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const data = [
  { date: 'Seg', volume: 120 },
  { date: 'Ter', volume: 150 },
  { date: 'Qua', volume: 180 },
  { date: 'Qui', volume: 140 },
  { date: 'Sex', volume: 220 },
  { date: 'Sáb', volume: 110 },
  { date: 'Dom', volume: 90 },
]

const recentActivity = [
  {
    id: 'LCN-8842',
    status: 'separando',
    time: '10 min atrás',
    desc: 'Iniciada separação na Zona A',
  },
  { id: 'LCN-8841', status: 'separado', time: '25 min atrás', desc: 'Pronto para despacho' },
  { id: 'LCN-8839', status: 'finalizado', time: '1 hr atrás', desc: 'Entregue com sucesso' },
  { id: 'LCN-8838', status: 'separando', time: '2 hrs atrás', desc: 'Aguardando conferência' },
]

export default function Index() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Visão Geral</h2>
        <p className="text-muted-foreground">Acompanhe o fluxo operacional em tempo real.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Em Separação
            </CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">24</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-500 font-medium">+12%</span> em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-amber-600">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-amber-600 font-medium">Atenção</span> 3 próximos do prazo
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Eficiência
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">94%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-[#10c98f] mr-1" />
              <span className="text-[#10c98f] font-medium">+2%</span> em relação à média
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Concluídas Hoje
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-[#10c98f]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">156</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">De 180 agendadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Volume de Entregas (7 Dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer
              config={{ volume: { label: 'Volume', color: 'hsl(var(--chart-2))' } }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10c98f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10c98f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#10c98f"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'separando' ? 'bg-blue-500' : activity.status === 'separado' ? 'bg-[#10c98f]' : 'bg-gray-400'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-id mr-2">{activity.id}</span>
                      <span className={`badge-${activity.status}`}>{activity.status}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.desc}</p>
                    <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
