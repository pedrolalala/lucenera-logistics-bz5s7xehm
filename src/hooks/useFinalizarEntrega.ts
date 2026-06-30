import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface FinalizarData {
  separacao_id: string
  cliente: string
  codigo_obra: string
  endereco: string
  recebido_por: string
  observacoes?: string
  gestora_equipe?: string
  numero_entrega?: string
}

export function useFinalizarEntrega() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const finalizarEntrega = async (data: FinalizarData): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      const { error: insertError } = await supabase.from('entregas_finalizadas').insert({
        separacao_id: data.separacao_id,
        cliente: data.cliente,
        codigo_obra: data.codigo_obra,
        data_entrega_real: new Date().toISOString(),
        endereco: data.endereco,
        recebido_por: data.recebido_por,
        observacoes: data.observacoes || null,
        gestora_equipe: data.gestora_equipe || null,
        numero_entrega: data.numero_entrega || null,
      })

      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from('separacoes')
        .update({ status: 'finalizado' })
        .eq('id', data.separacao_id)

      if (updateError) throw updateError

      toast({
        title: 'Entrega finalizada com sucesso!',
        className: 'bg-success text-success-foreground border-none',
      })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar entrega'
      toast({ title: 'Erro ao finalizar', description: message, variant: 'destructive' })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { finalizarEntrega, isSubmitting }
}
