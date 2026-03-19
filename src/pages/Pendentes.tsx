import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, AlertCircle } from 'lucide-react'

const pendingDeliveries = [
  {
    id: 'LCN-8891',
    client: "Rede D'Or",
    address: 'Av. Paulista, 100',
    route: 'Rota Sul',
    deadline: 'Hoje, 14:00',
    urgent: true,
  },
  {
    id: 'LCN-8892',
    client: 'Droga Raia',
    address: 'Rua Augusta, 1500',
    route: 'Rota Centro',
    deadline: 'Hoje, 16:30',
    urgent: false,
  },
  {
    id: 'LCN-8894',
    client: 'Hospital Sírio',
    address: 'Rua Dona Adma Jafet, 115',
    route: 'Rota Centro',
    deadline: 'Amanhã, 09:00',
    urgent: false,
  },
  {
    id: 'LCN-8895',
    client: 'Oncoclínicas',
    address: 'Av. Brasil, 500',
    route: 'Rota Oeste',
    deadline: 'Amanhã, 11:00',
    urgent: false,
  },
]

export default function Pendentes() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Entregas Pendentes</h2>
        <p className="text-muted-foreground">
          Aguardando alocação de motorista ou liberação de pátio.
        </p>
      </div>

      <Card className="border-t-4 border-t-amber-500 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider">
                  ID Rastreio
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Cliente / Destino
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Zona/Rota
                </TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">
                  Prazo Máximo
                </TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDeliveries.map((delivery) => (
                <TableRow
                  key={delivery.id}
                  className={delivery.urgent ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}
                >
                  <TableCell className="font-id font-bold">
                    <div className="flex items-center">
                      {delivery.urgent && (
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2 animate-pulse-subtle" />
                      )}
                      {delivery.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-base">{delivery.client}</div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {delivery.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {delivery.route}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${delivery.urgent ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}
                    >
                      {delivery.deadline}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="font-semibold">
                      <Truck className="w-4 h-4 mr-2" /> Alocar
                    </Button>
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
