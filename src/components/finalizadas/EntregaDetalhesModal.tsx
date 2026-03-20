import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EntregaDetalhesModal({ entrega, open, onClose }: any) {
  if (!entrega) return null

  // Fallback logic for identifier
  const idDisplay = entrega.numero_entrega
    ? entrega.numero_entrega
    : entrega.codigo_obra
      ? `LUC-${String(entrega.codigo_obra).padStart(4, '0')}`
      : 'N/A'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Entrega</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Cliente</p>
            <p className="text-lg font-bold">{entrega.cliente}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">
                Código do Pedido
              </p>
              <p className="font-mono font-bold text-primary">{idDisplay}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Cód. Obra</p>
              <p className="font-mono">{entrega.codigo_obra || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Data da Entrega</p>
              <p>
                {entrega.data_entrega_real
                  ? format(parseISO(entrega.data_entrega_real), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Gestora</p>
              <p className="font-medium text-foreground">{entrega.gestora_equipe || 'N/A'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Endereço</p>
            <p>{entrega.endereco || 'N/A'}</p>
          </div>
          {entrega.recebido_por && (
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Recebido por</p>
              <p className="font-medium">{entrega.recebido_por}</p>
            </div>
          )}
          {entrega.observacoes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Observações</p>
              <p className="text-sm bg-muted p-3 rounded-md mt-1">{entrega.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
