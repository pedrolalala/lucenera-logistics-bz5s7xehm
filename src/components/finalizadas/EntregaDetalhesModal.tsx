import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
export function EntregaDetalhesModal({ entrega, open, onClose, onUpdated }: any) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Entrega</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{entrega?.cliente}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
