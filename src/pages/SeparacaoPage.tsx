import { useMemo, useState, useEffect } from 'react'
import { Plus, CalendarDays, Search, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DateRange } from 'react-day-picker'
import { AppLayout } from '@/components/layout/AppLayout'
import { FilterDropdown } from '@/components/ui/filter-dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateSection } from '@/components/separacao/DateSection'
import { SeparacaoCard } from '@/components/separacao/SeparacaoCard'
import { EmptyState } from '@/components/separacao/EmptyState'
import { LoadingSkeleton } from '@/components/separacao/LoadingSkeleton'
import { SeparacaoFormModal } from '@/components/separacao/SeparacaoFormModal'
import { CreateRouteModal } from '@/components/separacao/CreateRouteModal'
import { FinalizarEntregaModal } from '@/components/separacao/FinalizarEntregaModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes'
import { FiltroSegmento, StatusSeparacao } from '@/types/separacao'
import { useUserRole } from '@/hooks/useUserRole'
import {
  format,
  subDays,
  subMonths,
  isAfter,
  isBefore,
  startOfDay,
  parseISO,
  isEqual,
  eachDayOfInterval,
} from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Scissors, PackageCheck } from 'lucide-react'

export default function SeparacaoPage() {
  const navigate = useNavigate()
  const { separacoes, isLoading, updateStatus, deleteSeparacao, refetch } = useSeparacoes()
  const { isAdmin } = useUserRole()
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas')
  const [statusFilter, setStatusFilter] = useState<'todos' | StatusSeparacao>('todos')
  const [tipoPedidoFilter, setTipoPedidoFilter] = useState<'todos' | 'normal' | 'garantia'>('todos')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState<string>('todos')
  const [garantiaOnly, setGarantiaOnly] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingSeparacao, setEditingSeparacao] = useState<Separacao | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [finalizarSeparacao, setFinalizarSeparacao] = useState<Separacao | null>(null)

  const [routeModalData, setRouteModalData] = useState<{
    isOpen: boolean
    date: Date
    deliveries: Separacao[]
  } | null>(null)

  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [highlightedId])

  const uniqueClients = useMemo(() => {
    const clients = new Set(separacoes.map((s) => s.cliente).filter(Boolean))
    return Array.from(clients).sort()
  }, [separacoes])

  const filteredSeparacoes = useMemo(() => {
    const today = startOfDay(new Date())

    return separacoes.filter((s) => {
      // Fix: separações 'Pendente' da Separação Parcial não têm
      // data_entrega ainda (só ganham data quando a venda inteira fica
      // 'Pronto') — parseISO(null) quebrava a página inteira.
      const entregaDate = s.data_entrega ? startOfDay(parseISO(s.data_entrega)) : null

      if (statusFilter !== 'todos' && s.status !== statusFilter) return false

      if (tipoPedidoFilter !== 'todos') {
        const tipo = s.tipo_pedido || 'normal'
        if (tipoPedidoFilter === 'garantia' && tipo !== 'garantia' && !s.inclui_garantia)
          return false
        if (tipoPedidoFilter === 'normal' && (tipo === 'garantia' || s.inclui_garantia))
          return false
      }

      if (garantiaOnly && !s.inclui_garantia && s.tipo_pedido !== 'garantia') return false

      if (clientFilter !== 'todos' && s.cliente !== clientFilter) return false

      if (searchQuery.trim()) {
        // SPEC-116: multi-termo em qualquer ordem, sem distinção de
        // acento — cada palavra digitada precisa aparecer em algum campo
        // (cliente, obra, endereço, responsável ou telefone). Antes só
        // casava cliente/obra com a frase inteira e era sensível a acento.
        const normalize = (v: string) =>
          v
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
        const terms = normalize(searchQuery.trim())
          .split(/\s+/)
          .filter(Boolean)
        const haystack = normalize(
          [s.cliente, s.codigo_obra, s.endereco, s.responsavel_recebimento, s.telefone]
            .filter(Boolean)
            .join(' '),
        )
        if (!terms.every((t) => haystack.includes(t))) return false
      }

      if (dateRange?.from) {
        if (!entregaDate) return false
        const rangeStart = startOfDay(dateRange.from)
        const rangeEnd = dateRange.to ? startOfDay(dateRange.to) : rangeStart
        const inRange =
          (isAfter(entregaDate, rangeStart) || isEqual(entregaDate, rangeStart)) &&
          (isBefore(entregaDate, rangeEnd) || isEqual(entregaDate, rangeEnd))
        if (!inRange) return false
      }

      let startDate: Date | null = null
      switch (filtro) {
        case 'ultima-semana':
          startDate = subDays(today, 7)
          break
        case 'ultimo-mes':
          startDate = subMonths(today, 1)
          break
        case 'ultimos-3-meses':
          startDate = subMonths(today, 3)
          break
        case 'ultimos-6-meses':
          startDate = subMonths(today, 6)
          break
        default:
          startDate = null
      }

      if (!startDate) return true
      if (!entregaDate) return true
      return isAfter(entregaDate, startDate) || isEqual(entregaDate, startDate)
    })
  }, [
    separacoes,
    filtro,
    dateRange,
    statusFilter,
    tipoPedidoFilter,
    searchQuery,
    clientFilter,
    garantiaOnly,
  ])

  // Fix: separações sem data_entrega ainda (ex.: 'Pendente' recém-criada
  // pela Separação Parcial) não cabem no agrupamento por dia — ficam numa
  // seção própria, "Aguardando data de entrega", em vez de quebrar o
  // agrupamento por data.
  const separacoesSemData = useMemo(
    () => filteredSeparacoes.filter((s) => !s.data_entrega),
    [filteredSeparacoes],
  )
  const separacoesComData = useMemo(
    () => filteredSeparacoes.filter((s) => s.data_entrega),
    [filteredSeparacoes],
  )

  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Separacao[] } = {}
    const today = startOfDay(new Date())

    const addToGroup = (dateKey: string, s: Separacao) => {
      if (!groups[dateKey]) groups[dateKey] = []
      if (!groups[dateKey].some((existing) => existing.id === s.id)) {
        groups[dateKey].push(s)
      }
    }

    separacoesComData.forEach((s) => {
      if (s.status === 'em_separacao' && s.data_inicio_separacao) {
        const statusChangedAt = startOfDay(parseISO(s.data_inicio_separacao))
        const deliveryDate = startOfDay(parseISO(s.data_entrega))
        const rangeStart = isAfter(statusChangedAt, today) ? today : statusChangedAt
        if (!isAfter(rangeStart, deliveryDate)) {
          const days = eachDayOfInterval({ start: rangeStart, end: deliveryDate })
          days.forEach((day) => addToGroup(format(day, 'yyyy-MM-dd'), s))
        } else {
          addToGroup(s.data_entrega, s)
        }
      } else {
        addToGroup(s.data_entrega, s)
      }
    })

    return Object.entries(groups)
      .filter(([dateStr]) => !isNaN(parseISO(dateStr).getTime()))
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateStr, items]) => ({ date: parseISO(dateStr), items }))
  }, [separacoesComData])

  const handleStatusChange = (id: string, newStatus: StatusSeparacao) => {
    updateStatus(id, newStatus)
  }

  const handleFormSuccess = () => {
    refetch()
    setEditingSeparacao(null)
  }

  const handleOpenCreate = () => {
    setEditingSeparacao(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (separacao: Separacao) => {
    setEditingSeparacao(separacao)
    setIsFormModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsFormModalOpen(false)
    setEditingSeparacao(null)
  }

  const handleCreateRoute = (date: Date, deliveries: Separacao[]) => {
    setRouteModalData({ isOpen: true, date, deliveries })
  }

  const handleFinalizarSuccess = () => {
    refetch()
    setFinalizarSeparacao(null)
  }

  return (
    <AppLayout>
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">Separação e Entregas</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={handleOpenCreate}
                  className="bg-success hover:bg-success-dark text-success-foreground"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Nova Separação</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
                <Button variant="outline" onClick={() => navigate('/calendario')} className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver em Calendário</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Tabs
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                className="w-full sm:w-auto"
              >
                <TabsList className="h-9">
                  <TabsTrigger value="todos" className="text-xs px-3 gap-1.5">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="material_solicitado" className="text-xs px-3 gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Solicitado</span>
                  </TabsTrigger>
                  <TabsTrigger value="em_separacao" className="text-xs px-3 gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Em Separação</span>
                  </TabsTrigger>
                  <TabsTrigger value="separado" className="text-xs px-3 gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Separado</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por cliente, obra, endereço, responsável..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[180px] bg-card border-border">
                  <SelectValue placeholder="Filtrar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {uniqueClients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card">
                <Switch
                  checked={garantiaOnly}
                  onCheckedChange={setGarantiaOnly}
                  id="garantia-toggle"
                />
                <Label htmlFor="garantia-toggle" className="text-xs font-medium cursor-pointer">
                  Só Garantia
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={tipoPedidoFilter}
                onValueChange={(v) => setTipoPedidoFilter(v as typeof tipoPedidoFilter)}
              >
                <SelectTrigger className="w-[160px] bg-card border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="garantia">Garantia</SelectItem>
                </SelectContent>
              </Select>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-auto"
              />
              <FilterDropdown value={filtro} onChange={setFiltro} />
              {filteredSeparacoes.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  Mostrando {filteredSeparacoes.length}{' '}
                  {filteredSeparacoes.length === 1 ? 'entrega' : 'entregas'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : groupedByDate.length === 0 && separacoesSemData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {separacoesSemData.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
                  <h2 className="text-xl font-bold text-primary">Aguardando data de entrega</h2>
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-medium">
                    {separacoesSemData.length}{' '}
                    {separacoesSemData.length === 1 ? 'entrega' : 'entregas'}
                  </span>
                </div>
                <div className="space-y-4">
                  {separacoesSemData.map((separacao) => (
                    <SeparacaoCard
                      key={separacao.id}
                      separacao={separacao}
                      onStatusChange={handleStatusChange}
                      onEdit={handleOpenEdit}
                      onDelete={deleteSeparacao}
                      onFinalizar={setFinalizarSeparacao}
                      isHighlighted={separacao.id === highlightedId}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </div>
            )}
            {groupedByDate.map(({ date, items }) => (
            <DateSection
              key={date.toISOString()}
              date={date}
              count={items.length}
              onCreateRoute={() =>
                handleCreateRoute(
                  date,
                  items.filter((s) => s.tipo_entrega !== 'cliente_retira'),
                )
              }
            >
              {items.map((separacao) => (
                <SeparacaoCard
                  key={separacao.id}
                  separacao={separacao}
                  onStatusChange={handleStatusChange}
                  onEdit={handleOpenEdit}
                  onDelete={deleteSeparacao}
                  onFinalizar={setFinalizarSeparacao}
                  isHighlighted={separacao.id === highlightedId}
                  isAdmin={isAdmin}
                />
              ))}
            </DateSection>
            ))}
          </>
        )}
      </div>

      <SeparacaoFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleFormSuccess}
        editData={editingSeparacao}
      />

      {routeModalData && (
        <CreateRouteModal
          isOpen={routeModalData.isOpen}
          onClose={() => setRouteModalData(null)}
          date={routeModalData.date}
          deliveries={routeModalData.deliveries}
        />
      )}

      <FinalizarEntregaModal
        isOpen={!!finalizarSeparacao}
        onClose={() => setFinalizarSeparacao(null)}
        separacao={finalizarSeparacao}
        onSuccess={handleFinalizarSuccess}
      />
    </AppLayout>
  )
}
