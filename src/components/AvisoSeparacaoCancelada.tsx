import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// SPEC-182 (D12): pop-up para quem cuida da Logística (Matheus) quando uma
// separação é cancelada por inteiro (estorno na Separação Parcial). Base: a
// pendência `separacao_estornada` que o banco já cria em entregas_pendentes
// (estornar_item_separacao). "Ciente" só esconde o aviso para este usuário
// neste navegador — a pendência continua na tela Pendentes até ser resolvida.
interface AvisoCancelamento {
  id: string
  codigo_obra: string | null
  cliente: string | null
  descricao_problema: string | null
  registrado_por: string | null
  created_at: string
}

const PENDENTE = ['aguardando_resolucao', 'em_analise', 'pendente']
const chaveVistos = (userId: string) => `aviso_separacao_cancelada_vistos:${userId}`

function lerVistos(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(chaveVistos(userId)) || '[]')
  } catch {
    return []
  }
}

function gravarVistos(userId: string, ids: string[]) {
  try {
    localStorage.setItem(chaveVistos(userId), JSON.stringify(ids.slice(-300)))
  } catch {
    // sem localStorage o aviso volta a aparecer — não quebra a tela
  }
}

const semPrefixo = (texto: string | null) => (texto || '').replace(/\b(VENDA|ORC)-(\d)/gi, '$2')

export function AvisoSeparacaoCancelada() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [avisos, setAvisos] = useState<AvisoCancelamento[]>([])

  useEffect(() => {
    if (!user?.id) return
    let ativo = true
    const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('entregas_pendentes')
      .select(
        'id, codigo_obra, cliente, descricao_problema, registrado_por, created_at, status_pendencia',
      )
      .eq('tipo_problema', 'separacao_estornada')
      .gte('created_at', desde)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!ativo || !data) return
        const vistos = new Set(lerVistos(user.id))
        setAvisos(
          (data as any[]).filter(
            (p) =>
              (!p.status_pendencia || PENDENTE.includes(p.status_pendencia)) && !vistos.has(p.id),
          ),
        )
      })
    return () => {
      ativo = false
    }
  }, [user?.id])

  if (!user?.id || avisos.length === 0) return null

  const ciente = () => {
    gravarVistos(user.id, [...lerVistos(user.id), ...avisos.map((a) => a.id)])
    setAvisos([])
  }

  return (
    <Dialog open onOpenChange={(aberto) => !aberto && ciente()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {avisos.length === 1 ? 'Separação cancelada' : `${avisos.length} separações canceladas`}
          </DialogTitle>
          <DialogDescription>
            Revise antes de continuar a separação ou a entrega destas obras.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-3 overflow-y-auto">
          {avisos.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            >
              <p className="font-semibold">
                #{semPrefixo(a.codigo_obra)} — {a.cliente || 'Cliente não identificado'}
              </p>
              <p className="text-sm text-foreground">{semPrefixo(a.descricao_problema)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cancelada por {a.registrado_por || 'Sistema'} em{' '}
                {format(parseISO(a.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              ciente()
              navigate('/pendentes')
            }}
          >
            Ver pendências
          </Button>
          <Button onClick={ciente}>Ciente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
