import { Info } from 'lucide-react'

// SPEC-226 D: legenda curta — o calendário só mostra entregas do dia por complexidade.
export function CalendarLegend() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm mt-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        Como ler o calendário
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Cada dia mostra quantas entregas estão marcadas para ele e de que complexidade. Clique no
        dia para ver a lista. O andamento da separação fica na tela de Separação (abas Solicitado
        / Em separação / Separado).
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded px-1 text-[11px] font-bold bg-green-500 text-white">1F</span>
          <span className="text-xs font-medium text-foreground">Fácil (≈ 1 dia)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded px-1 text-[11px] font-bold bg-orange-500 text-white">1M</span>
          <span className="text-xs font-medium text-foreground">Médio (≈ 2 dias)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded px-1 text-[11px] font-bold bg-red-500 text-white">1C</span>
          <span className="text-xs font-medium text-foreground">Complexo (≈ 3 dias)</span>
        </div>
      </div>
    </div>
  )
}
