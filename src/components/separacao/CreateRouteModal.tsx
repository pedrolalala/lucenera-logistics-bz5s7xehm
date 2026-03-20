import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Building2,
  Sparkles,
  GripVertical,
  MapPin,
  Copy,
  Navigation2,
  ExternalLink,
  Hand,
} from 'lucide-react'
import { Separacao } from '@/hooks/useSeparacoes'
import { useToast } from '@/hooks/use-toast'

interface CreateRouteModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  deliveries: Separacao[]
}

export function CreateRouteModal({
  isOpen,
  onClose,
  date,
  deliveries = [],
}: CreateRouteModalProps) {
  const [ordered, setOrdered] = useState<Separacao[]>([])
  const [departureTime, setDepartureTime] = useState('08:00')
  const [timePerDelivery, setTimePerDelivery] = useState('30')
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setOrdered([...deliveries])
    }
  }, [isOpen, deliveries])

  const handleCopyList = () => {
    if (ordered.length === 0) return
    const text = ordered
      .map((d, i) => `${i + 1}. ${d.cliente}\nEndereço: ${d.endereco}`)
      .join('\n\n')
    const header = `Rota de Entregas - ${format(date, 'dd/MM/yyyy')}\nSaída: ${departureTime}\n\n`
    navigator.clipboard.writeText(header + text)
    toast({ title: 'Lista copiada para a área de transferência!' })
  }

  const handleGoogleMaps = () => {
    if (ordered.length === 0) return
    const origin = encodeURIComponent(
      'R. Dr. Hugo Fortes, 1010 - Parque Industrial Lagoinha - Ribeirão Preto/SP',
    )
    const destination = encodeURIComponent(ordered[ordered.length - 1].endereco)
    const waypoints = ordered
      .slice(0, -1)
      .map((d) => encodeURIComponent(d.endereco))
      .join('|')
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`
    window.open(url, '_blank')
  }

  const handleOptimize = () => {
    toast({ title: 'Otimizando rota...', description: 'A IA está calculando a melhor sequência.' })
    setTimeout(() => {
      setOrdered([...ordered].reverse()) // Mock shuffle for visual feedback
      toast({
        title: 'Rota otimizada com sucesso!',
        className: 'bg-success text-white border-none',
      })
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh] bg-background">
        <div className="p-6 border-b border-border bg-card/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Criar Rota Otimizada -{' '}
            <span className="capitalize">
              {date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : ''}
            </span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {deliveries?.length} entregas agendadas
          </p>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">PONTO DE PARTIDA</Label>
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <div className="font-bold text-sm">ESTOQUE LUCENERA</div>
                  <div className="text-xs opacity-80 mt-0.5">
                    R. Dr. Hugo Fortes, 1010 – Parque Industrial Lagoinha – Ribeirão Preto/SP
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">HORÁRIO DE SAÍDA</Label>
                <Input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="h-11 bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">
                  TEMPO POR ENTREGA (MIN)
                </Label>
                <Input
                  type="number"
                  value={timePerDelivery}
                  onChange={(e) => setTimePerDelivery(e.target.value)}
                  className="h-11 bg-card"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleOptimize}
                className="bg-[#10c98f] hover:bg-[#10c98f]/90 text-white gap-2 h-11 px-6 flex-1 sm:flex-none"
              >
                <Sparkles className="w-4 h-4" /> Otimizar Rota com IA
              </Button>
              <Button variant="outline" className="gap-2 h-11 px-6 bg-card flex-1 sm:flex-none">
                <Hand className="w-4 h-4" /> Ordenar Manualmente
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground">
                ENTREGAS DO DIA ({ordered.length})
              </Label>
              <div className="space-y-3">
                {ordered.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <button className="mt-1 cursor-grab text-muted-foreground/50 hover:text-foreground transition-colors shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="w-7 h-7 bg-zinc-800 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <h4 className="font-bold text-foreground text-sm uppercase leading-tight">
                          {d.cliente}
                        </h4>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded shrink-0">
                          {d.codigo_obra}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 mt-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <p className="text-xs leading-relaxed">{d.endereco}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {ordered.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                    Nenhuma entrega selecionada para rota.
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-card/50 flex flex-wrap items-center justify-between gap-4 mt-auto">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleGoogleMaps}
              className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 h-10"
            >
              <Navigation2 className="w-4 h-4" /> Google Maps
            </Button>
            <Button variant="outline" className="gap-2 bg-card h-10">
              <ExternalLink className="w-4 h-4" /> Waze
            </Button>
            <Button variant="outline" onClick={handleCopyList} className="gap-2 bg-card h-10">
              <Copy className="w-4 h-4" /> Copiar Lista
            </Button>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-10 w-full sm:w-auto">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
