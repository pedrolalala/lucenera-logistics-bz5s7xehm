import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
export function SolvePendenciaModal({ isOpen, onClose, pendencia, onSuccess }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver Pendência</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Formulário de resolução.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
