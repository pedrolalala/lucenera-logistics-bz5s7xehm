import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download } from 'lucide-react'

const finishedDeliveries = [
  {
    id: 'LCN-8701',
    client: 'Pão de Açúcar',
    date: '19 Mar 2026',
    time: '14:23',
    driver: 'Carlos S.',
    status: 'Entregue',
  },
  {
    id: 'LCN-8702',
    client: 'Hospital Santa Joana',
    date: '19 Mar 2026',
    time: '15:45',
    driver: 'Roberto M.',
    status: 'Entregue',
  },
  {
    id: 'LCN-8705',
    client: 'Drogaria São Paulo',
    date: '18 Mar 2026',
    time: '09:12',
    driver: 'Ana L.',
    status: 'Entregue',
  },
  {
    id: 'LCN-8710',
    client: 'UBS Pinheiros',
    date: '18 Mar 2026',
    time: '11:30',
    driver: 'Carlos S.',
    status: 'Entregue',
  },
  {
    id: 'LCN-8712',
    client: 'Hospital das Clínicas',
    date: '17 Mar 2026',
    time: '16:05',
    driver: 'Roberto M.',
    status: 'Entregue',
  },
]

export default function Finalizadas() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">
            Histórico de Entregas
          </h2>
          <p className="text-muted-foreground">Registro imutável de operações concluídas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="font-semibold">
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center bg-muted/20">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ID, Cliente..." className="pl-9 bg-background" />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" /> Filtros Avançados
          </Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider">
                  ID Rastreio
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Cliente
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Data / Hora
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Motorista
                </TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishedDeliveries.map((delivery) => (
                <TableRow key={delivery.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-id font-medium">{delivery.id}</TableCell>
                  <TableCell className="font-medium text-base">{delivery.client}</TableCell>
                  <TableCell>
                    <div className="font-medium">{delivery.date}</div>
                    <div className="text-xs text-muted-foreground">{delivery.time}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{delivery.driver}</TableCell>
                  <TableCell className="text-right">
                    <span className="badge-finalizado">{delivery.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
