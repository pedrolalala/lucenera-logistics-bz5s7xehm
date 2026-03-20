import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { EntregaPendente } from '@/types/separacao'

export function useEntregasPendentes() {
  const [pendentes, setPendentes] = useState<EntregaPendente[]>([])
  const [resolvedPendentes, setResolvedPendentes] = useState<EntregaPendente[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPendentes = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('entregas_pendentes')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      const allData = (data as any[]) || []

      const pend = allData.filter(
        (p) =>
          !p.status_pendencia ||
          p.status_pendencia === 'aguardando_resolucao' ||
          p.status_pendencia === 'em_analise' ||
          p.status_pendencia === 'pendente',
      )

      const resolved = allData.filter(
        (p) => p.status_pendencia === 'resolvido' || p.status_pendencia === 'cancelado',
      )

      const parseFotos = (fotos: any) => {
        if (!fotos) return []
        if (typeof fotos === 'string') {
          try {
            return JSON.parse(fotos)
          } catch {
            return [fotos]
          }
        }
        if (Array.isArray(fotos)) return fotos
        return []
      }

      setPendentes(
        pend.map((p) => ({
          ...p,
          fotos_urls: parseFotos(p.fotos_urls),
          fotos_resolucao: parseFotos(p.fotos_resolucao),
        })),
      )

      setResolvedPendentes(
        resolved.map((p) => ({
          ...p,
          fotos_urls: parseFotos(p.fotos_urls),
          fotos_resolucao: parseFotos(p.fotos_resolucao),
        })),
      )
    } catch (err: any) {
      console.error('Error fetching entregas pendentes:', err)
      setError(err.message || 'Erro ao carregar pendências')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendentes()
  }, [fetchPendentes])

  return {
    pendentes,
    resolvedPendentes,
    isLoading,
    error,
    refetch: fetchPendentes,
  }
}
