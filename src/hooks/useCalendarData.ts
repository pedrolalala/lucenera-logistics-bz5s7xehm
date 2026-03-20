import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'

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
  const [data, setData] = useState<MonthData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [totalEntregas, setTotalEntregas] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const start = startOfMonth(new Date(year, month))
      const end = endOfMonth(new Date(year, month))

      const { data: separacoes, error } = await supabase
        .from('separacoes')
        .select('*')
        .gte('data_entrega', format(start, 'yyyy-MM-dd'))
        .lte('data_entrega', format(end, 'yyyy-MM-dd'))
        .in('status', ['material_solicitado', 'em_separacao', 'separado'])

      if (error) throw error

      const monthData: MonthData = {}
      let total = 0

      separacoes?.forEach((s: any) => {
        if (!s.data_entrega) return

        // Ensure we only use the date part for grouping
        const dateKey = s.data_entrega.split('T')[0]

        if (!monthData[dateKey]) {
          monthData[dateKey] = {
            total: 0,
            materialSolicitado: 0,
            emSeparacao: 0,
            separado: 0,
            garantia: 0,
            pendente: 0,
            finalizado: 0,
            separando: 0,
            entregas: [],
          }
        }

        monthData[dateKey].total += 1
        monthData[dateKey].entregas.push(s)
        total += 1

        switch (s.status) {
          case 'material_solicitado':
            monthData[dateKey].materialSolicitado += 1
            monthData[dateKey].separando += 1
            break
          case 'em_separacao':
            monthData[dateKey].emSeparacao += 1
            monthData[dateKey].separando += 1
            break
          case 'separado':
            monthData[dateKey].separado += 1
            break
          case 'matheus_separacao_garantia':
            monthData[dateKey].garantia += 1
            break
          case 'pendente':
            monthData[dateKey].pendente += 1
            break
          case 'finalizado':
            monthData[dateKey].finalizado += 1
            break
        }
      })

      setData(monthData)
      setTotalEntregas(total)
    } catch (err) {
      console.error('Error fetching calendar data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, totalEntregas, refetch: fetchData }
}
