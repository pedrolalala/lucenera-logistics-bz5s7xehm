import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export type EntregaFinalizada = {
  id: string
  cliente: string
  codigo_obra: string
  data_entrega_real: string
  recebido_por?: string
  numero_pedido?: string
  endereco?: string
  observacoes?: string
}

export function useEntregasFinalizadas() {
  const [entregas, setEntregas] = useState<EntregaFinalizada[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntregas = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('entregas_finalizadas')
        .select('*')
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
