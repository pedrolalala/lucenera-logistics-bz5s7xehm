export type OptimizedRouteResult = {
  rota_otimizada: { id: string; ordem: number }[]
  metricas: any
  justificativa: string
}
export function useOptimizeRoute() {
  return {
    optimizeRoute: async (origin: string, deliveries: any[]) => null as OptimizedRouteResult | null,
    isOptimizing: false,
  }
}
