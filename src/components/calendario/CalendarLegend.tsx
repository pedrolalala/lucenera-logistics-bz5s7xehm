import { Info } from 'lucide-react'

export function CalendarLegend() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm mt-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        Legenda do Calendário
      </h3>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-12">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground tracking-wider">
            STATUS (PROGRESSIVO):
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground bg-transparent flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                #
              </div>
              <span className="text-xs font-medium text-foreground">Material Solicitado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-muted-foreground bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                #
              </div>
              <span className="text-xs font-medium text-foreground">Em Separação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted-foreground border border-muted-foreground flex items-center justify-center text-[10px] font-bold text-background">
                #
              </div>
              <span className="text-xs font-medium text-foreground">Separado</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground tracking-wider">
            NÍVEL DE COMPLEXIDADE (COR):
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm"></div>
              <span className="text-xs font-medium text-foreground">Fácil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-sm"></div>
              <span className="text-xs font-medium text-foreground">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></div>
              <span className="text-xs font-medium text-foreground">Difícil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
