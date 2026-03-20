import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export type EntregaFinalizada = {
  id: string
  separacao_id?: string
  cliente: string
  codigo_obra: string | number
  data_entrega_real: string
  data_solicitacao?: string
  created_at?: string
  recebido_por?: string
  numero_pedido?: string
  endereco?: string
  observacoes?: string
  numero_entrega?: string
  gestora_equipe?: string
  separacoes?:
    | {
        inclui_garantia?: boolean
        data_inicio_separacao?: string
      }
    | null
    | any
  // other fields if needed
  [key: string]: any
}

export function useEntregasFinalizadas() {
  const [entregas, setEntregas] = useState<EntregaFinalizada[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntregas = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Ajuste na consulta para aproveitar a nova estrutura da chave estrangeira criada,
      // garantindo que o join `separacoes` execute de forma contínua e previsível.
      const { data, error: err } = await supabase
        .from('entregas_finalizadas')
        .select(`
          *,
          separacoes (
            inclui_garantia,
            data_inicio_separacao
          )
        `)
        .order('data_entrega_real', { ascending: false })

      if (err) throw err

      setEntregas((data as any[]) || [])
    } catch (err: any) {
      console.error('Error fetching entregas finalizadas:', err)
      setError(err.message || 'Erro ao carregar entregas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas])

  return { entregas, isLoading, error, refetch: fetchEntregas }
}
