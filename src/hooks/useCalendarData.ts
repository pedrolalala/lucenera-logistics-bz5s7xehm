export type DayData = {
  total: number
  materialSolicitado: number
  emSeparacao: number
  separado: number
  garantia: number
  pendente: number
  finalizado: number
  separando: number
  entregas: any[]
}
export type MonthData = Record<string, DayData>
export function useCalendarData(year: number, month: number) {
  return { data: {} as MonthData, isLoading: false, totalEntregas: 0, refetch: () => {} }
}
