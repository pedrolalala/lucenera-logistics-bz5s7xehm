import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EntregaFinalizadaRow({ entrega, onOpenDetails }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors">
      <div>
        <p className="font-bold text-foreground">{entrega.cliente}</p>
        <p className="text-sm text-muted-foreground">
          {entrega.data_entrega_real
            ? format(parseISO(entrega.data_entrega_real), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
            : 'Data não informada'}{' '}
          • Obra: {entrega.codigo_obra || 'N/A'}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => onOpenDetails(entrega)}>
        Ver Detalhes
      </Button>
    </div>
  )
}
