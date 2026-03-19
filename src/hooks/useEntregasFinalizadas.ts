export type EntregaFinalizada = {
  id: string
  cliente: string
  codigo_obra: string
  data_entrega_real: string
  recebido_por?: string
}
export function useEntregasFinalizadas() {
  return { entregas: [] as EntregaFinalizada[], isLoading: false, error: null, refetch: () => {} }
}
