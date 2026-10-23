import { useEffect, useState } from 'react'
import { Ban, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separacao } from '@/hooks/useSeparacoes'
import { abrirEmailRecusa } from '@/lib/logistica'

const MOTIVOS_RAPIDOS = [
  'Falta informação na solicitação',
  'Não dá tempo para a data pedida',
  'Falta material no estoque',
]

interface RecusarModalProps {
  separacao: Separacao | null
  onClose: () => void
  onConfirm: (id: string, motivo: string) => Promise<boolean>
}

// SPEC-226 C: recusar com motivo obrigatório e avisar quem pediu por e-mail (Outlook).
export function RecusarModal({ separacao, onClose, onConfirm }: RecusarModalProps) {
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (separacao) setMotivo('')
  }, [separacao])

  const handleConfirm = async () => {
    if (!separacao || !motivo.trim()) return
    setSalvando(true)
    const ok = await onConfirm(separacao.id, motivo.trim())
    setSalvando(false)
    if (ok) {
      await abrirEmailRecusa(separacao, motivo.trim())
      onClose()
    }
  }

  return (
    <Dialog open={!!separacao} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-destructive" /> Recusar solicitação
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{separacao?.cliente}</span>
            {separacao?.numero_entrega ? ` · ${separacao.numero_entrega}` : ''}
            <br />A solicitação sai da fila e volta para quem pediu corrigir. Depois de
            confirmar, abre um e-mail pronto no Outlook — é só conferir e enviar.
          </p>
          <div className="flex flex-wrap gap-2">
            {MOTIVOS_RAPIDOS.map((m) => (
              <Button
                key={m}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMotivo(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground">MOTIVO *</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Explique o que precisa ser ajustado..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!motivo.trim() || salvando}
            className="w-full sm:w-auto"
          >
            {salvando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Recusar e abrir e-mail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
