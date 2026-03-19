import { Button } from '@/components/ui/button'
export function EntregaFinalizadaRow({ entrega, onOpenDetails }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <p className="font-bold">{entrega.cliente}</p>
        <p className="text-sm text-muted-foreground">{entrega.data_entrega_real}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => onOpenDetails(entrega)}>
        Ver Detalhes
      </Button>
    </div>
  )
}
