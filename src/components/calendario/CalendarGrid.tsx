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

function getGroupStyle(complexity: string, status: string) {
  let colorClasses = {
    solid: 'bg-gray-500 text-white border-gray-600',
    light: 'bg-gray-100 text-gray-700 border-gray-400',
    outline: 'bg-transparent text-gray-600 border-gray-400 border-2',
  }

  if (complexity === 'facil') {
    colorClasses = {
      solid: 'bg-green-500 text-white border-green-600',
      light: 'bg-green-100 text-green-700 border-green-400',
      outline: 'bg-transparent text-green-600 border-green-500 border-2',
    }
  } else if (complexity === 'medio') {
    colorClasses = {
      solid: 'bg-orange-500 text-white border-orange-600',
      light: 'bg-orange-100 text-orange-700 border-orange-400',
      outline: 'bg-transparent text-orange-600 border-orange-500 border-2',
    }
  } else if (complexity === 'dificil') {
    colorClasses = {
      solid: 'bg-red-500 text-white border-red-600',
      light: 'bg-red-100 text-red-700 border-red-400',
      outline: 'bg-transparent text-red-600 border-red-500 border-2',
    }
  }

  if (status === 'separado' || status === 'finalizado') return colorClasses.solid
  if (status === 'em_separacao') return colorClasses.light
  return colorClasses.outline
}

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

            // Group deliveries by complexity and status
            const groups: Record<string, { count: number; complexity: string; status: string }> = {}
            if (dayData?.entregas) {
              dayData.entregas.forEach((e) => {
                const comp = e.nivel_complexidade || 'none'
                const stat = e.status || 'none'
                const key = `${comp}-${stat}`
                if (!groups[key]) {
                  groups[key] = { count: 0, complexity: comp, status: stat }
                }
                groups[key].count += 1
              })
            }

            const sortedGroups = Object.values(groups).sort((a, b) => {
              const order = { facil: 1, medio: 2, dificil: 3, none: 4 }
              const aOrder = order[a.complexity as keyof typeof order] || 5
              const bOrder = order[b.complexity as keyof typeof order] || 5
              return aOrder - bOrder
            })

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

                <div className="flex flex-wrap justify-center gap-1 w-full mt-1 px-1">
                  {sortedGroups.map((g, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm transition-transform hover:scale-110',
                        getGroupStyle(g.complexity, g.status),
                      )}
                      title={`${g.count} entrega(s) - ${g.complexity.toUpperCase()} / ${g.status.replace(/_/g, ' ').toUpperCase()}`}
                    >
                      {g.count}
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
