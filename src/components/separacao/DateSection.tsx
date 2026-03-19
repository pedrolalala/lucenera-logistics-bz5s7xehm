import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface DateSectionProps {
  date: Date
  count: number
  onCreateRoute: () => void
  children: ReactNode
}

export function DateSection({ date, count, onCreateRoute, children }: DateSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-border pb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-primary capitalize font-serif">
            {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-medium">
            {count} {count === 1 ? 'entrega' : 'entregas'}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onCreateRoute} className="gap-2">
          <Map className="w-4 h-4" />
          Criar Rota
        </Button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
