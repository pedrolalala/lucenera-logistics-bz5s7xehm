import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { MonthData } from '@/hooks/useCalendarData'

interface CalendarGridProps {
  currentMonth: Date
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  monthData: MonthData
  isLoading: boolean
}

// SPEC-226 D: o calendário mostra só as entregas do dia (pela data da entrega),
// com a quantidade e a complexidade — sem misturar status de separação.
const COMP = [
  { key: 'facil', letra: 'F', label: 'Fácil', cls: 'bg-green-500 text-white' },
  { key: 'medio', letra: 'M', label: 'Médio', cls: 'bg-orange-500 text-white' },
  { key: 'dificil', letra: 'C', label: 'Complexo', cls: 'bg-red-500 text-white' },
  { key: 'none', letra: '?', label: 'Sem complexidade', cls: 'bg-gray-400 text-white' },
]

export function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  monthData,
  isLoading,
}: CalendarGridProps) {
  const start = startOfWeek(startOfMonth(currentMonth))
  const end = endOfWeek(endOfMonth(currentMonth))

  const days = eachDayOfInterval({ start, end })
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-b border-border pb-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayData = monthData[dateKey]
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())

            const porComp: Record<string, number> = {}
            dayData?.entregas?.forEach((e) => {
              const k = COMP.some((c) => c.key === e.nivel_complexidade) ? e.nivel_complexidade : 'none'
              porComp[k] = (porComp[k] || 0) + 1
            })
            const total = dayData?.total || 0

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day)}
                className={cn(
                  'min-h-[70px] sm:min-h-[100px] p-1 border rounded-lg sm:rounded-xl flex flex-col items-center transition-all duration-200 relative group',
                  !isCurrentMonth && 'opacity-40 bg-muted/30',
                  isSelected
                    ? 'border-primary ring-1 sm:ring-2 ring-primary/20 shadow-sm bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/10',
                  isToday && !isSelected && 'border-primary/50 bg-primary/5',
                )}
              >
                <span
                  className={cn(
                    'text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-1 transition-colors',
                    isToday && !isSelected && 'bg-primary text-primary-foreground',
                    isSelected && 'bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>

                {total > 0 && (
                  <>
                    <span className="text-[10px] sm:text-xs font-bold text-foreground leading-none">
                      {total}
                      <span className="hidden sm:inline">
                        {total === 1 ? ' entrega' : ' entregas'}
                      </span>
                    </span>
                    <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 w-full mt-1 px-0.5">
                      {COMP.filter((c) => porComp[c.key]).map((c) => (
                        <span
                          key={c.key}
                          className={cn(
                            'rounded px-1 text-[9px] sm:text-[11px] font-bold leading-4',
                            c.cls,
                          )}
                          title={`${porComp[c.key]} ${c.label}`}
                        >
                          {porComp[c.key]}
                          {c.letra}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
