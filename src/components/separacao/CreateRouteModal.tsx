import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
export function CreateRouteModal({ isOpen, onClose, date, deliveries }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Rota</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Gerenciamento de rotas em desenvolvimento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
