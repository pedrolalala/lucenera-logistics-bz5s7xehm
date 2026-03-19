import { PackageSearch } from 'lucide-react'

export function EmptyState({
  title = 'Nenhuma entrega encontrada',
  subtitle = 'Não há separações para os filtros e datas selecionados.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
      <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
        <PackageSearch className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 font-serif">{title}</h3>
      <p className="text-muted-foreground max-w-md">{subtitle}</p>
    </div>
  )
}
