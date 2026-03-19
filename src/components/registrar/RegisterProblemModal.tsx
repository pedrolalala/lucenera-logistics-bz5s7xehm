import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
export function RegisterProblemModal({ isOpen, onClose, separacao, onSuccess }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Problema</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Modal de Problemas</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
