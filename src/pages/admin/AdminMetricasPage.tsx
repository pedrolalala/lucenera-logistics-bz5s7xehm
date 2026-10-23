import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { differenceInMinutes, format, parseISO, subDays } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COMPLEXIDADE_LABEL } from '@/lib/logistica'

// SPEC-226 G: tempo de cada etapa, medido pelos cliques de status (o banco carimba a hora).
// Solicitado → Em separação (fila) · Em separação → Separado (separação) · pedido → data
// pedida para a entrega (antecedência que a equipe dá ao estoque).

type Linha = {
  id: string
  numero_entrega: string | null
  cliente: string | null
  nivel_complexidade: string | null
  qtd_itens: number
  pedido_em: string
  data_entrega: string | null
  inicio_separacao: string | null
  separado_em: string | null
  entregue_em: string | null
  status: string
}

const horas = (min: number | null) => {
  if (min === null || Number.isNaN(min)) return '—'
  if (min < 60) return `${Math.round(min)} min`
  if (min < 60 * 24) return `${(min / 60).toFixed(1).replace('.', ',')} h`
  return `${(min / 60 / 24).toFixed(1).replace('.', ',')} dias`
}

const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

const minEntre = (a: string | null, b: string | null) =>
  a && b ? Math.max(0, differenceInMinutes(parseISO(b), parseISO(a))) : null

// data pedida = meio-dia daquele dia (só existe a data)
const ateEntrega = (pedido: string, data: string | null) =>
  data ? differenceInMinutes(parseISO(`${data}T12:00:00`), parseISO(pedido)) : null

export default function AdminMetricasPage() {
  const [dias, setDias] = useState('90')

  const { data, isLoading, error } = useQuery({
    queryKey: ['logistica-metricas', dias],
    queryFn: async () => {
      const { data: rows, error: err } = await (supabase as any).rpc('logistica_metricas_etapas', {
        p_de: format(subDays(new Date(), Number(dias)), 'yyyy-MM-dd'),
        p_ate: format(new Date(), 'yyyy-MM-dd'),
      })
      if (err) throw err
      return (rows || []) as Linha[]
    },
  })

  const resumo = useMemo(() => {
    const grupos = ['facil', 'medio', 'dificil', 'todas']
    return grupos.map((g) => {
      const ls = (data || []).filter((l) => g === 'todas' || l.nivel_complexidade === g)
      const fila = ls.map((l) => minEntre(l.pedido_em, l.inicio_separacao)).filter((x): x is number => x !== null)
      const sep = ls.map((l) => minEntre(l.inicio_separacao, l.separado_em)).filter((x): x is number => x !== null)
      const antec = ls.map((l) => ateEntrega(l.pedido_em, l.data_entrega)).filter((x): x is number => x !== null)
      return {
        g,
        qtd: ls.length,
        itens: media(ls.map((l) => Number(l.qtd_itens) || 0)),
        fila: media(fila),
        sep: media(sep),
        antec: media(antec),
        emCimaDaHora: antec.filter((m) => m < 24 * 60).length,
      }
    })
  }, [data])

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Métricas de separação</h1>
          <p className="text-sm text-muted-foreground">
            Medido pelos cliques: vale o horário em que o status foi trocado no sistema.
          </p>
        </div>
        <Select value={dias} onValueChange={setDias}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Pedidos dos últimos 30 dias</SelectItem>
            <SelectItem value="90">Pedidos dos últimos 90 dias</SelectItem>
            <SelectItem value="365">Pedidos dos últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Média por complexidade</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase">
                  <tr className="border-b">
                    <th className="text-left py-2">Complexidade</th>
                    <th className="text-right py-2">Pedidos</th>
                    <th className="text-right py-2">Peças (média)</th>
                    <th className="text-right py-2">Esperando na fila</th>
                    <th className="text-right py-2">Separando</th>
                    <th className="text-right py-2">Antecedência do pedido</th>
                    <th className="text-right py-2">Pedidos com menos de 1 dia</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.map((r) => (
                    <tr key={r.g} className={'border-b last:border-0 ' + (r.g === 'todas' ? 'font-bold' : '')}>
                      <td className="py-2">{r.g === 'todas' ? 'Todas' : COMPLEXIDADE_LABEL[r.g]}</td>
                      <td className="py-2 text-right">{r.qtd}</td>
                      <td className="py-2 text-right">{r.itens === null ? '—' : r.itens.toFixed(0)}</td>
                      <td className="py-2 text-right">{horas(r.fila)}</td>
                      <td className="py-2 text-right">{horas(r.sep)}</td>
                      <td className="py-2 text-right">{horas(r.antec)}</td>
                      <td className="py-2 text-right">{r.emCimaDaHora}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                Fila = do pedido até clicar "Iniciar Separação". Separando = de "Iniciar" até
                "Separado". Antecedência = do pedido até a data de entrega pedida. Pedidos
                anteriores a esta versão não têm a hora de "Separado".
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pedidos ({data?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground uppercase">
                  <tr className="border-b">
                    <th className="text-left py-2">Nº</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Compl.</th>
                    <th className="text-right py-2">Peças</th>
                    <th className="text-left py-2">Pedido em</th>
                    <th className="text-left py-2">Entrega pedida</th>
                    <th className="text-right py-2">Fila</th>
                    <th className="text-right py-2">Separando</th>
                    <th className="text-left py-2">Entregue</th>
                  </tr>
                </thead>
                <tbody>
                  {(data || []).map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-1.5 font-mono">{l.numero_entrega || '—'}</td>
                      <td className="py-1.5">{l.cliente}</td>
                      <td className="py-1.5">{COMPLEXIDADE_LABEL[l.nivel_complexidade || ''] || '—'}</td>
                      <td className="py-1.5 text-right">{l.qtd_itens}</td>
                      <td className="py-1.5 whitespace-nowrap">
                        {format(parseISO(l.pedido_em), 'dd/MM HH:mm')}
                      </td>
                      <td className="py-1.5">
                        {l.data_entrega ? format(parseISO(l.data_entrega), 'dd/MM/yy') : '—'}
                      </td>
                      <td className="py-1.5 text-right">{horas(minEntre(l.pedido_em, l.inicio_separacao))}</td>
                      <td className="py-1.5 text-right">
                        {horas(minEntre(l.inicio_separacao, l.separado_em))}
                      </td>
                      <td className="py-1.5">
                        {l.entregue_em ? format(parseISO(l.entregue_em), 'dd/MM/yy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  )
}
