import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FiltroSegmento } from '@/types/separacao'
import { Filter } from 'lucide-react'

interface FilterDropdownProps {
  value: FiltroSegmento
  onChange: (value: FiltroSegmento) => void
}

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as FiltroSegmento)}>
      <SelectTrigger className="w-[180px] bg-card border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Período" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todas">Todos os períodos</SelectItem>
        <SelectItem value="ultima-semana">Última semana</SelectItem>
        <SelectItem value="ultimo-mes">Último mês</SelectItem>
        <SelectItem value="ultimos-3-meses">Últimos 3 meses</SelectItem>
        <SelectItem value="ultimos-6-meses">Últimos 6 meses</SelectItem>
        <SelectItem value="personalizar">Personalizar</SelectItem>
      </SelectContent>
    </Select>
  )
}
