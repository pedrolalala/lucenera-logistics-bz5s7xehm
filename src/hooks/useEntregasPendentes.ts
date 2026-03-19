import { EntregaPendente } from '@/types/separacao'
export function useEntregasPendentes() {
  return {
    pendentes: [] as EntregaPendente[],
    resolvedPendentes: [] as EntregaPendente[],
    isLoading: false,
    refetch: () => {},
  }
}
