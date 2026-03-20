import { Button } from '@/components/ui/button'
import { format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Eye, User } from 'lucide-react'
import { EntregaFinalizada } from '@/hooks/useEntregasFinalizadas'
import { cn } from '@/lib/utils'

interface Props {
  entrega: EntregaFinalizada
  onOpenDetails: (entrega: EntregaFinalizada) => void
}

export function EntregaFinalizadaRow({ entrega, onOpenDetails }: Props) {
  // Extract possible nested separacoes object from join
  const separacao = Array.isArray(entrega.separacoes) ? entrega.separacoes[0] : entrega.separacoes

  const isGarantia = separacao?.inclui_garantia === true

  // Fallback logic for identifier (LUC-XXXX)
  const idDisplay = entrega.numero_entrega
    ? entrega.numero_entrega
    : entrega.codigo_obra
      ? `LUC-${String(entrega.codigo_obra).padStart(4, '0')}`
      : 'LUC-0000'

  // Date formatting
  const dateReal = entrega.data_entrega_real ? parseISO(entrega.data_entrega_real) : null
  const dateStr = dateReal ? format(dateReal, 'dd/MM/yyyy') : '--/--/----'

  // Delta calculation for SLA
  // Priority: data_solicitacao -> separacoes.data_inicio_separacao -> created_at
  const rawStartDate =
    entrega.data_solicitacao || separacao?.data_inicio_separacao || entrega.created_at
  let deltaDays = 0
  let deltaDisplay = 'NO MESMO DIA'

  if (dateReal && rawStartDate) {
    const startDate = parseISO(rawStartDate)
    deltaDays = differenceInCalendarDays(startOfDay(dateReal), startOfDay(startDate))
    if (deltaDays > 0) {
      deltaDisplay = `${deltaDays}D`
    } else if (deltaDays < 0) {
      // Just in case data is corrupted
      deltaDisplay = 'NO MESMO DIA'
    }
  }

  const gestora = entrega.gestora_equipe || 'NÃO INFORMADO'

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-card hover:bg-muted/30 transition-colors border-b last:border-0 gap-4">
      {/* Left Side: Status, Badges and Identifiers */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="bg-emerald-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md tracking-wide shadow-sm">
          FINALIZADO
        </span>

        {isGarantia && (
          <span className="border border-orange-500 text-orange-600 bg-orange-50 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md tracking-wide">
            GARANTIA
          </span>
        )}

        <span className="font-mono text-sm md:text-base font-bold text-muted-foreground whitespace-nowrap">
          {idDisplay}
        </span>

        <span className="font-bold text-sm md:text-base text-foreground uppercase tracking-tight">
          {entrega.cliente}
        </span>
      </div>

      {/* Right Side: Metrics, Assignees and Actions */}
      <div className="flex items-center gap-4 md:gap-6 flex-wrap md:flex-nowrap">
        <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
          {dateStr}
        </span>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 whitespace-nowrap shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-bold tracking-wide">{deltaDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap min-w-[120px]">
          <User className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase truncate max-w-[150px]">{gestora}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetails(entrega)}
          className="gap-2 h-8 text-xs font-medium shrink-0 ml-auto md:ml-0 hover:bg-muted"
        >
          <Eye className="w-3.5 h-3.5" />
          Detalhes
        </Button>
      </div>
    </div>
  )
}
