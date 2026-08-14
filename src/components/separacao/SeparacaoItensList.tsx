import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Package } from 'lucide-react'

interface SeparacaoItensListProps {
  separacaoId: string
}

interface ItemRow {
  id: string
  descricao: string
  quantidade: number
  codigoProduto: number | null
}

// Fix pós-SPEC-099: a Separação Parcial grava as peças em separacao_itens
// (estruturado, com produto_id/quantidade), mas nenhum card do Logística
// lia essa tabela — o Matheus via a entrega sem saber o que tinha nela.
export function SeparacaoItensList({ separacaoId }: SeparacaoItensListProps) {
  const [itens, setItens] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase
      .from('separacao_itens')
      .select('id, descricao, quantidade, produtos(codigo_produto)')
      .eq('separacao_id', separacaoId)
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setItens([])
        } else {
          setItens(
            (data || []).map((r: any) => ({
              id: r.id,
              descricao: r.descricao,
              quantidade: Number(r.quantidade) || 0,
              codigoProduto: r.produtos?.codigo_produto ?? null,
            })),
          )
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [separacaoId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando peças...
      </div>
    )
  }

  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma peça vinculada a esta separação.</p>
  }

  return (
    <div className="space-y-1.5">
      {itens.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-2 text-sm p-2 rounded-md bg-muted/40"
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {item.codigoProduto != null && (
              <span className="font-mono text-primary shrink-0">{item.codigoProduto}</span>
            )}
            <span className="truncate">{item.descricao}</span>
          </span>
          <span className="font-semibold shrink-0">{item.quantidade}</span>
        </div>
      ))}
    </div>
  )
}
