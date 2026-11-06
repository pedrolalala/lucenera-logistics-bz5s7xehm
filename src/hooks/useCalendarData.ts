import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { agruparEntregas, type GrupoEntrega } from '@/lib/agrupar-entregas'

export type DayData = {
  /** SPEC-256: entregas reais do dia (listas do mesmo cliente e endereço contam como UMA). */
  total: number
  /** SPEC-256: quantidade de listas (separações) do dia, antes de agrupar. */
  listas: number
  grupos: GrupoEntrega[]
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
        // Fix pós-SPEC-099: mesmo motivo do useSeparacoes — "Pronto" precisa
        // contar aqui, senão a Separação Parcial fica invisível no calendário.
        .in('status', ['material_solicitado', 'Em separação', 'separado', 'Pronto'])

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
            listas: 0,
            grupos: [],
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

        monthData[dateKey].entregas.push(s)

        switch (s.status) {
          case 'material_solicitado':
            monthData[dateKey].materialSolicitado += 1
            monthData[dateKey].separando += 1
            break
          case 'Em separação':
            monthData[dateKey].emSeparacao += 1
            monthData[dateKey].separando += 1
            break
          case 'separado':
          case 'Pronto':
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

      // SPEC-256: agrupa as listas do mesmo cliente + endereço; o total do dia e do mês conta entregas, não listas
      for (const dia of Object.values(monthData)) {
        dia.listas = dia.entregas.length
        dia.grupos = agruparEntregas(dia.entregas)
        dia.total = dia.grupos.length
        total += dia.total
      }

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
