import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { enviarArquivo } from '@/lib/logistica'

interface FinalizarData {
  separacao_id: string
  cliente: string
  codigo_obra: string
  endereco: string
  recebido_por: string
  observacoes?: string
  gestora_equipe?: string
  numero_entrega?: string
  // Achado 2026-09-14 (SPEC-143, verificação da Logística): RegistrarEntregaPage
  // tem um campo "Data Real da Entrega" editável, mas o insert sempre usava
  // `new Date()` (agora), ignorando a data escolhida — parâmetro opcional
  // pra permitir corrigir quando a entrega foi em outro dia.
  data_entrega_real?: string
  // SPEC-226 E: quem levou, com quem foi combinado (responsável da solicitação) e as fotos
  // do documento assinado. Achado 23/10: as fotos eram exigidas na tela mas nunca enviadas.
  entregue_por?: string
  combinado_com?: string
  fotos?: File[]
}

export function useFinalizarEntrega() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const finalizarEntrega = async (data: FinalizarData): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      const fotosCaminhos: string[] = []
      for (let i = 0; i < (data.fotos || []).length; i++) {
        fotosCaminhos.push(
          await enviarArquivo('entregas-fotos', String(data.codigo_obra || 'sem-obra'), data.fotos![i], i),
        )
      }

      const { error: insertError } = await supabase.from('entregas_finalizadas').insert({
        separacao_id: data.separacao_id,
        cliente: data.cliente,
        codigo_obra: data.codigo_obra,
        // 'yyyy-MM-dd' vira meio-dia local para não voltar um dia no fuso
        data_entrega_real: data.data_entrega_real
          ? new Date(`${data.data_entrega_real}T12:00:00`).toISOString()
          : new Date().toISOString(),
        endereco: data.endereco,
        recebido_por: data.recebido_por,
        entregue_por: data.entregue_por || null,
        combinado_com: data.combinado_com || null,
        fotos_urls: fotosCaminhos.length ? JSON.stringify(fotosCaminhos) : null,
        observacoes: data.observacoes || null,
        gestora_equipe: data.gestora_equipe || null,
        numero_entrega: data.numero_entrega || null,
      } as any)

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
