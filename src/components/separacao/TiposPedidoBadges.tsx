import { Package, ShieldCheck, Undo2 } from 'lucide-react'
import { Separacao } from '@/hooks/useSeparacoes'
import { isDevolucao, isGarantia, temEntregaNormal } from '@/lib/logistica'

// SPEC-226 B3: a mesma visita pode ter entrega + garantia (amarelo) + devolução (vermelho).
// Sempre com o nome escrito — a cor sozinha não basta.
export function TiposPedidoBadges({ separacao }: { separacao: Separacao }) {
  const garantia = isGarantia(separacao)
  const devolucao = isDevolucao(separacao)
  if (!garantia && !devolucao) return null
  return (
    <>
      {temEntregaNormal(separacao) && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border border-border text-muted-foreground bg-muted">
          <Package className="w-3 h-3" /> Entrega
        </div>
      )}
      {garantia && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500 text-yellow-800 bg-yellow-100">
          <ShieldCheck className="w-3 h-3" /> Garantia
        </div>
      )}
      {devolucao && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border border-red-500 text-red-700 bg-red-100">
          <Undo2 className="w-3 h-3" /> Devolução
        </div>
      )}
    </>
  )
}
