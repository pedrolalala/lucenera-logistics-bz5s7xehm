import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export function SolvePendenciaModal({ isOpen, onClose, pendencia, onSuccess }: any) {
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSolve = async () => {
    if (!pendencia) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('entregas_pendentes')
        .update({
          status_pendencia: 'resolvido',
          observacoes_resolucao: observacoes,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.email?.split('@')[0] || 'Usuário',
          resolved_by_user_id: user?.id,
        })
        .eq('id', pendencia.id)

      if (error) throw error

      toast({
        title: 'Pendência resolvida',
        description: 'A pendência foi marcada como resolvida com sucesso.',
        className: 'bg-success text-success-foreground',
      })
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Erro ao resolver',
        description: error.message || 'Ocorreu um erro ao resolver a pendência.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver Pendência: #{pendencia?.codigo_obra}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Como foi resolvido?</label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva a solução do problema..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSolve}
            disabled={isSubmitting || !observacoes.trim()}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {isSubmitting ? 'Salvando...' : 'Marcar como Resolvido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
