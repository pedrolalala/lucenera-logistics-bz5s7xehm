import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Calendario() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Visão Operacional</h2>
        <p className="text-muted-foreground">Agendamentos e previsões de despacho por data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        <Card className="shadow-sm order-2 md:order-1">
          <CardHeader>
            <CardTitle className="font-serif">
              Programação para {date?.toLocaleDateString('pt-BR') || 'Hoje'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Manhã (08:00 - 12:00)
              </h4>
              <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div>
                  <p className="font-id">LCN-9910</p>
                  <p className="text-sm font-medium">Hospital Sírio Libanês</p>
                </div>
                <span className="badge-separando">Em Separação</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div>
                  <p className="font-id">LCN-9912</p>
                  <p className="text-sm font-medium">Rede D'Or</p>
                </div>
                <span className="badge-pendente">Agendado</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                Tarde (13:00 - 18:00)
              </h4>
              <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                <div>
                  <p className="font-id">LCN-9905</p>
                  <p className="text-sm font-medium">Clínica Einstein</p>
                </div>
                <span className="badge-finalizado">Finalizado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm order-1 md:order-2 h-fit">
          <CardContent className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0 w-full max-w-[280px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
