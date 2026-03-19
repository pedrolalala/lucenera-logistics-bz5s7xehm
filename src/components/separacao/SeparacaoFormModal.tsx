import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
export function SeparacaoFormModal({ isOpen, onClose, onSuccess, editData }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editData ? 'Editar Separação' : 'Nova Separação'}</DialogTitle>
          <DialogDescription>Preencha os dados da separação.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Formulário em desenvolvimento.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
