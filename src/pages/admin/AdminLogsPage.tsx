import { Fragment, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns'
import { ChevronDown, ChevronRight, Loader2, Printer, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// SPEC-226 I: registro do que cada conta fez no Logística e a que horas.
// Fonte = auditoria central (SPEC-206), lida pela RPC logistica_listar_log, que só
// responde para admin do Logística. Só leitura: ninguém edita nem apaga.

type Evento = {
  id: number
  criado_em: string
  usuario_id: string | null
  usuario_nome: string | null
  usuario_email: string | null
  tipo: string
  entidade: string | null
  registro_id: string | null
  referencia: string | null
  mudancas: Record<string, unknown> | null
  total: number
}

const TIPOS: Record<string, string> = {
  login: 'Entrou no sistema',
  abriu_tela: 'Abriu tela',
  criou: 'Criou',
  alterou: 'Alterou',
  mudou_status: 'Mudou status',
  apagou: 'Apagou',
  imprimiu: 'Imprimiu',
  enviou_email: 'Abriu e-mail',
  abriu_documento: 'Abriu documento',
  exportou: 'Exportou lista',
  senha_alterada: 'Trocou a senha',
}

const ENTIDADES: Record<string, string> = {
  separacoes: 'Separação',
  separacao_itens: 'Peças da separação',
  separacao_arquivos: 'Anexo',
  entregas_finalizadas: 'Baixa de entrega',
  entregas_pendentes: 'Problema na entrega',
  user_roles_separacao: 'Permissão',
}

const CAMPOS: Record<string, string> = {
  status: 'Status',
  data_entrega: 'Data de entrega',
  motivo_recusa: 'Motivo da recusa',
  responsavel_recebimento: 'Quem vai receber',
  recebido_por: 'Recebido por',
  entregue_por: 'Entregue por',
  observacoes_internas: 'Observação',
  garantia_detalhes: 'Garantia',
  devolucao_detalhes: 'Devolução',
  nivel_complexidade: 'Complexidade',
  endereco: 'Endereço',
  itens_incluidos: 'Peças incluídas',
  itens_removidos: 'Peças removidas',
  itens_alterados: 'Peças alteradas',
  detalhe: 'Detalhe',
}

const PERIODOS = [
  { v: '1', l: 'Hoje' },
  { v: '7', l: 'Últimos 7 dias' },
  { v: '30', l: 'Últimos 30 dias' },
  { v: '90', l: 'Últimos 90 dias' },
  { v: '365', l: 'Últimos 12 meses' },
]

const fmt = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    try {
      return format(parseISO(s), 'dd/MM/yyyy HH:mm')
    } catch {
      return s
    }
  }
  return s
}

function Mudancas({ tipo, m }: { tipo: string; m: Record<string, unknown> | null }) {
  if (!m || Object.keys(m).length === 0) return <span className="text-muted-foreground">—</span>
  const ehDiff = tipo === 'alterou' || tipo === 'mudou_status' || tipo === 'aprovou'
  return (
    <table className="text-xs w-full">
      <tbody>
        {Object.entries(m).map(([k, v]) => {
          const par = ehDiff && Array.isArray(v) && v.length === 2
          return (
            <tr key={k} className="border-b border-border/50 last:border-0 align-top">
              <td className="py-1 pr-3 font-medium text-muted-foreground whitespace-nowrap">
                {CAMPOS[k] || k}
              </td>
              <td className="py-1 break-all">
                {par ? (
                  <>
                    <span className="line-through text-red-700/80">{fmt((v as unknown[])[0])}</span>
                    {' → '}
                    <span className="text-green-700 font-medium">{fmt((v as unknown[])[1])}</span>
                  </>
                ) : (
                  fmt(v)
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function AdminLogsPage() {
  const [dias, setDias] = useState('7')
  const [usuario, setUsuario] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [busca, setBusca] = useState('')
  const [telas, setTelas] = useState(false)
  const [aberto, setAberto] = useState<number | null>(null)
  const [limite, setLimite] = useState(200)

  const periodo = useMemo(
    () => ({
      de: startOfDay(subDays(new Date(), Number(dias) - 1)).toISOString(),
      ate: endOfDay(new Date()).toISOString(),
    }),
    [dias],
  )

  const { data: pessoas } = useQuery({
    queryKey: ['logistica-log-usuarios'],
    queryFn: async () => {
      const { data } = await (supabase as any).rpc('logistica_log_usuarios', {
        p_de: subDays(new Date(), 365).toISOString(),
      })
      return (data || []) as { usuario_id: string; usuario_nome: string; usuario_email: string }[]
    },
  })

  const {
    data: eventos,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['logistica-log', periodo, usuario, tipo, busca, telas, limite],
    queryFn: async () => {
      const { data, error: err } = await (supabase as any).rpc('logistica_listar_log', {
        p_de: periodo.de,
        p_ate: periodo.ate,
        p_usuario: usuario === 'todos' ? null : usuario,
        p_tipo: tipo === 'todos' ? null : tipo,
        p_busca: busca.trim() || null,
        p_incluir_telas: telas,
        p_limite: limite,
        p_offset: 0,
      })
      if (err) throw err
      return (data || []) as Evento[]
    },
  })

  const total = eventos?.[0]?.total ?? 0

  const imprimir = () => {
    if (!eventos?.length) return
    const esc = (v: unknown) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    const linhas = eventos
      .map(
        (e) =>
          `<tr><td>${format(parseISO(e.criado_em), 'dd/MM/yyyy HH:mm:ss')}</td><td>${esc(e.usuario_nome)}<br><small>${esc(e.usuario_email || '')}</small></td><td>${esc(TIPOS[e.tipo] || e.tipo)}</td><td>${esc(e.referencia || '')}</td><td><small>${esc(
            e.mudancas
              ? Object.entries(e.mudancas)
                  .map(([k, v]) => `${CAMPOS[k] || k}: ${Array.isArray(v) ? v.map(fmt).join(' → ') : fmt(v)}`)
                  .join(' | ')
              : '',
          )}</small></td></tr>`,
      )
      .join('')
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Registro de log - Logística</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top}th{background:#f2f2f2}</style></head><body>
<h2>Registro de log — Sistema de Entregas</h2><div>${eventos.length} de ${total} eventos · ${PERIODOS.find((p) => p.v === dias)?.l} · impresso em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</div><br>
<table><tr><th>Quando</th><th>Conta</th><th>Ação</th><th>O quê</th><th>Detalhes</th></tr>${linhas}</table>
<script>window.onload=function(){window.print()}</script></body></html>`)
    w.document.close()
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Registro de log</h1>
          <p className="text-sm text-muted-foreground">
            Tudo o que foi feito no Sistema de Entregas: qual conta, o quê e a que horas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar'}
          </Button>
          <Button variant="outline" onClick={imprimir} disabled={!eventos?.length} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6 flex flex-wrap items-center gap-3">
          <Select value={dias} onValueChange={setDias}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODOS.map((p) => (
                <SelectItem key={p.v} value={p.v}>
                  {p.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={usuario} onValueChange={setUsuario}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as contas</SelectItem>
              {(pessoas || []).map((p) => (
                <SelectItem key={p.usuario_id} value={p.usuario_id}>
                  {p.usuario_nome || p.usuario_email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as ações</SelectItem>
              {Object.entries(TIPOS).map(([k, l]) => (
                <SelectItem key={k} value={k}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Cliente, nº da entrega, pessoa..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="telas" checked={telas} onCheckedChange={setTelas} />
            <Label htmlFor="telas" className="text-xs cursor-pointer">
              Mostrar telas abertas
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-destructive">
              {(error as Error).message || 'Erro ao carregar o registro.'}
            </p>
          ) : !eventos?.length ? (
            <p className="p-6 text-sm text-muted-foreground">Nada registrado neste filtro.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="w-6" />
                    <th className="text-left p-3 whitespace-nowrap">Quando</th>
                    <th className="text-left p-3">Conta</th>
                    <th className="text-left p-3">Ação</th>
                    <th className="text-left p-3">O quê</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e) => {
                    const temDetalhe = !!e.mudancas && Object.keys(e.mudancas).length > 0
                    const isOpen = aberto === e.id
                    return (
                      <Fragment key={e.id}>
                        <tr
                          className={
                            'border-t border-border ' +
                            (temDetalhe ? 'cursor-pointer hover:bg-muted/30' : '')
                          }
                          onClick={() => temDetalhe && setAberto(isOpen ? null : e.id)}
                        >
                          <td className="pl-3 text-muted-foreground">
                            {temDetalhe &&
                              (isOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              ))}
                          </td>
                          <td className="p-3 whitespace-nowrap font-mono text-xs">
                            {format(parseISO(e.criado_em), 'dd/MM/yyyy HH:mm:ss')}
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{e.usuario_nome || '—'}</div>
                            <div className="text-xs text-muted-foreground">{e.usuario_email}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {TIPOS[e.tipo] || e.tipo}
                            {e.entidade && ENTIDADES[e.entidade] && (
                              <div className="text-xs text-muted-foreground">
                                {ENTIDADES[e.entidade]}
                              </div>
                            )}
                          </td>
                          <td className="p-3">{e.referencia || '—'}</td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-muted/20">
                            <td />
                            <td colSpan={4} className="p-3">
                              <Mudancas tipo={e.tipo} m={e.mudancas} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
              <div className="p-3 text-xs text-muted-foreground flex items-center justify-between border-t">
                <span>
                  Mostrando {eventos.length} de {total}
                </span>
                {eventos.length < total && limite < 1000 && (
                  <Button size="sm" variant="outline" onClick={() => setLimite((l) => l + 200)}>
                    Carregar mais
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
