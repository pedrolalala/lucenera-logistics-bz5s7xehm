import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useFinalizarEntrega } from '@/hooks/useFinalizarEntrega'
import { Separacao } from '@/hooks/useSeparacoes'

interface FinalizarEntregaModalProps {
  isOpen: boolean
  onClose: () => void
  separacao: Separacao | null
  onSuccess: () => void
}

export function FinalizarEntregaModal({
  isOpen,
  onClose,
  separacao,
  onSuccess,
}: FinalizarEntregaModalProps) {
  const { finalizarEntrega, isSubmitting } = useFinalizarEntrega()
  const [recebidoPor, setRecebidoPor] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRecebidoPor('')
      setObservacoes('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!separacao || !recebidoPor.trim()) return
    const success = await finalizarEntrega({
      separacao_id: separacao.id,
      cliente: separacao.cliente,
      codigo_obra: separacao.codigo_obra,
      endereco: separacao.endereco_entrega || separacao.endereco || '',
      recebido_por: recebidoPor.trim(),
      observacoes: observacoes.trim() || undefined,
      gestora_equipe: separacao.gestora_equipe || undefined,
      numero_entrega: separacao.numero_entrega || undefined,
    })
    if (success) {
      onSuccess()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Finalizar Entrega
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground">CLIENTE</Label>
            <p className="text-sm font-medium text-foreground">{separacao?.cliente}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">RECEBIDO POR *</Label>
            <Input
              value={recebidoPor}
              onChange={(e) => setRecebidoPor(e.target.value)}
              placeholder="Nome de quem recebeu a entrega"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">
              OBSERVAÇÕES (OPCIONAL)
            </Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Observações sobre a entrega..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!recebidoPor.trim() || isSubmitting}
            className="w-full sm:w-auto bg-success hover:bg-success-dark text-success-foreground"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Finalizar Entrega
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
