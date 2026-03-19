import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { Package, User, MapPin, Box } from 'lucide-react'

type OrderStatus = 'separando' | 'separado'

interface Order {
  id: string
  client: string
  items: number
  zone: string
  status: OrderStatus
  priority: boolean
}

const initialOrders: Order[] = [
  {
    id: 'LCN-9012',
    client: 'Hospital Santa Maria',
    items: 45,
    zone: 'A1',
    status: 'separando',
    priority: true,
  },
  {
    id: 'LCN-9013',
    client: 'Farmácia Central',
    items: 12,
    zone: 'B3',
    status: 'separando',
    priority: false,
  },
  {
    id: 'LCN-9014',
    client: 'Clínica Vida',
    items: 8,
    zone: 'A2',
    status: 'separado',
    priority: false,
  },
  {
    id: 'LCN-9015',
    client: 'Laboratório Exame',
    items: 120,
    zone: 'C1',
    status: 'separando',
    priority: true,
  },
  {
    id: 'LCN-9016',
    client: 'Distribuidora Sul',
    items: 55,
    zone: 'B1',
    status: 'separado',
    priority: false,
  },
]

export default function Separacao() {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const handleFinalize = (id: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: 'separado' as OrderStatus } : o)))
    setSelectedOrder(null)
    toast({
      title: 'Separação Finalizada',
      description: `Pedido ${id} marcado como pronto para despacho.`,
      className: 'bg-[#10c98f] text-white border-none',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Fila de Separação</h2>
          <p className="text-muted-foreground">Gerencie os pedidos em fase de picking e packing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className={`cursor-pointer ${order.status === 'separando' ? 'status-card-separando' : 'status-card-separado'} ${order.priority && order.status === 'separando' ? 'animate-pulse-subtle' : ''}`}
            onClick={() => setSelectedOrder(order)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="font-id text-lg">{order.id}</CardTitle>
                <span className={`badge-${order.status}`}>{order.status}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="field-label">Cliente</span>
                <span className="field-value line-clamp-1">{order.client}</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="field-label">Zona</span>
                  <span className="field-value flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" /> {order.zone}
                  </span>
                </div>
                <div>
                  <span className="field-label">Itens</span>
                  <span className="field-value flex items-center">
                    <Package className="h-3 w-3 mr-1 text-muted-foreground" /> {order.items} un
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md border-l-0 shadow-2xl flex flex-col">
          <SheetHeader className="mb-6 border-b pb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`badge-${selectedOrder?.status}`}>{selectedOrder?.status}</span>
              {selectedOrder?.priority && <Badge variant="destructive">Alta Prioridade</Badge>}
            </div>
            <SheetTitle className="font-id text-3xl">{selectedOrder?.id}</SheetTitle>
            <SheetDescription>Detalhes operativos da separação.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-8 overflow-y-auto pr-4">
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <span className="field-label flex items-center">
                  <User className="h-4 w-4 mr-2" /> Cliente Destino
                </span>
                <span className="field-value text-lg">{selectedOrder?.client}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="field-label flex items-center">
                    <MapPin className="h-4 w-4 mr-2" /> Zona de Picking
                  </span>
                  <span className="field-value text-lg">{selectedOrder?.zone}</span>
                </div>
                <div>
                  <span className="field-label flex items-center">
                    <Package className="h-4 w-4 mr-2" /> Total de Itens
                  </span>
                  <span className="field-value text-lg">{selectedOrder?.items}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold mb-4 flex items-center">
                <Box className="mr-2 h-5 w-5" /> Checklist de Itens
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-md bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded border border-primary/50" />
                      <span className="font-medium text-sm">
                        SKU-{Math.floor(Math.random() * 10000)} - Lote C
                      </span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {Math.floor(Math.random() * 50)} cx
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t mt-auto">
            {selectedOrder?.status === 'separando' ? (
              <Button
                className="w-full h-14 text-lg font-bold bg-[#10c98f] hover:bg-[#0da172] text-white shadow-lg"
                onClick={() => handleFinalize(selectedOrder.id)}
              >
                Finalizar Separação
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full h-14 text-lg font-bold">
                Pronto para Despacho
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
