import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function EntregaDetalhesModal({ entrega, open, onClose }: any) {
  if (!entrega) return null

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
              <p className="text-sm font-medium text-muted-foreground uppercase">Cód. Obra</p>
              <p className="font-mono">{entrega.codigo_obra || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Pedido</p>
              <p className="font-mono">{entrega.numero_pedido || 'N/A'}</p>
            </div>
          </div>
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
            <p className="text-sm font-medium text-muted-foreground uppercase">Endereço</p>
            <p>{entrega.endereco || 'N/A'}</p>
          </div>
          {entrega.recebido_por && (
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Recebido por</p>
              <p>{entrega.recebido_por}</p>
            </div>
          )}
          {entrega.observacoes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Observações</p>
              <p className="text-sm">{entrega.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
