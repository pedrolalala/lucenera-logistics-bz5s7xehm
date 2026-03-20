import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, Route, Edit, Package, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DayDetails({ selectedDate, dayData, onEditSeparacao, onCreateRoute }: any) {
  if (!selectedDate) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4 min-h-[400px]">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-2">
          <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <div>
          <h3 className="text-base font-medium text-foreground">
            Selecione uma data no calendário
          </h3>
          <p className="text-sm mt-1">Clique em qualquer dia com entregas para ver detalhes</p>
        </div>
      </div>
    )
  }

  const hasDeliveries = dayData && dayData.entregas && dayData.entregas.length > 0

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border sticky top-0 bg-card z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground capitalize flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {hasDeliveries
              ? `${dayData.total} ${dayData.total === 1 ? 'entrega programada' : 'entregas programadas'}`
              : 'Nenhuma entrega programada'}
          </p>
        </div>
        {hasDeliveries && (
          <Button onClick={onCreateRoute} size="sm" variant="default" className="gap-2 shadow-sm">
            <Route className="w-4 h-4" />
            <span className="hidden sm:inline">Criar Rota</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-4">
        {!hasDeliveries ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-muted/20 rounded-xl border border-dashed border-border">
            Dia livre. Nenhuma entrega agendada para {format(selectedDate, 'dd/MM/yyyy')}.
          </div>
        ) : (
          dayData.entregas.map((entrega: any) => {
            const complexityColor =
              entrega.nivel_complexidade === 'facil'
                ? 'bg-green-500'
                : entrega.nivel_complexidade === 'medio'
                  ? 'bg-orange-500'
                  : entrega.nivel_complexidade === 'dificil'
                    ? 'bg-red-500'
                    : 'bg-gray-300'

            const statusLabel = entrega.status
              ? entrega.status.replace(/_/g, ' ').toUpperCase()
              : 'DESCONHECIDO'

            return (
              <div
                key={entrega.id}
                className="bg-background border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all shadow-sm relative overflow-hidden group"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${complexityColor}`}></div>

                <div className="pl-3">
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm">
                          {entrega.codigo_obra || 'Sem Código'}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-mono py-0 h-4.5 px-1.5 uppercase tracking-wider"
                        >
                          {statusLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {entrega.cliente || 'Cliente não informado'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => onEditSeparacao(entrega)}
                      title="Editar Separação"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/70" />
                      <span className="line-clamp-2 leading-relaxed">
                        {entrega.endereco || 'Endereço não informado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                      <span className="capitalize">
                        {entrega.tipo_entrega?.replace(/_/g, ' ') || 'Tipo não definido'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
