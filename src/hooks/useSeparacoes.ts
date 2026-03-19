import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { StatusSeparacao, NivelComplexidade, TipoEntrega } from '@/types/separacao'

export type DeliveryType = 'flexible' | 'scheduled'

export interface Separacao {
  id: string
  cliente: string
  codigo_obra: string
  data_entrega: string
  responsavel_recebimento: string
  telefone: string | null
  endereco: string
  status: StatusSeparacao
  material_tipo: 'texto' | 'imagem' | 'pdf' | 'tabela' | 'arquivos' | null
  material_conteudo: string
  delivery_type: DeliveryType
  scheduled_time: string | null
  order_in_route: number | null
  observacoes_internas: string | null
  gestora_equipe: string
  numero_venda: string[]
  solicitante: string | null
  separacoes_parciais: string[] | null
  nivel_complexidade: NivelComplexidade | null
  tipo_entrega: TipoEntrega | null
  transportadora_nome: string | null
  codigo_rastreamento: string | null
  numero_entrega: string | null
  data_inicio_separacao: string | null
  created_at: string
  updated_at: string
  tipo_pedido?: string
  garantia_detalhes?: string | null
  inclui_garantia?: boolean
  garantia_peca?: string | null
  garantia_motivo?: string | null
}

export function useSeparacoes() {
  const [separacoes, setSeparacoes] = useState<Separacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSeparacoes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('separacoes')
        .select('*')
        .in('status', ['material_solicitado', 'em_separacao', 'separado'])
        .order('data_entrega', { ascending: true })

      if (fetchError) throw fetchError

      setSeparacoes((data || []) as Separacao[])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar separações'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: StatusSeparacao) => {
    const previousSeparacoes = [...separacoes]
    setSeparacoes((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)))

    try {
      const updatePayload: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'em_separacao') {
        updatePayload.data_inicio_separacao = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('separacoes')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) throw updateError

      toast({
        title: 'Status atualizado!',
        className: 'bg-success text-success-foreground border-none',
      })
      await fetchSeparacoes()
    } catch (err) {
      setSeparacoes(previousSeparacoes)
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status'
      toast({ title: 'Erro ao atualizar', description: message, variant: 'destructive' })
    }
  }

  const deleteSeparacao = async (id: string) => {
    try {
      await supabase.from('separacao_arquivos').delete().eq('separacao_id', id)
      await supabase.from('separacao_itens').delete().eq('separacao_id', id)
      const { error: deleteError } = await supabase.from('separacoes').delete().eq('id', id)

      if (deleteError) throw deleteError

      setSeparacoes((prev) => prev.filter((s) => s.id !== id))
      toast({ title: 'Excluído com sucesso', className: 'bg-success text-white border-none' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    }
  }

  const findByCodigoObra = async (codigo: string): Promise<Separacao | null> => {
    try {
      const isNumeroEntrega = /^LUC-/i.test(codigo)
      const { data, error } = await supabase
        .from('separacoes')
        .select('*')
        .eq(
          isNumeroEntrega ? 'numero_entrega' : 'codigo_obra',
          isNumeroEntrega ? codigo.toUpperCase() : codigo,
        )
        .maybeSingle()

      if (error) throw error
      return (data as Separacao) || null
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    fetchSeparacoes()
  }, [])

  return {
    separacoes,
    isLoading,
    error,
    updateStatus,
    deleteSeparacao,
    findByCodigoObra,
    refetch: fetchSeparacoes,
  }
}
