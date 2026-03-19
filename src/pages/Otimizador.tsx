import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Map, MapPin, Zap, RefreshCw, Navigation } from 'lucide-react'

const addresses = [
  { id: '1', addr: 'Hospital Santa Joana, Paraíso', status: 'pending' },
  { id: '2', addr: 'Clínica Vida, Vila Mariana', status: 'pending' },
  { id: '3', addr: 'Laboratório Fleury, Morumbi', status: 'pending' },
  { id: '4', addr: 'Centro Médico, Pinheiros', status: 'pending' },
]

export default function Otimizador() {
  const { toast } = useToast()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimized, setOptimized] = useState(false)

  const handleOptimize = () => {
    setIsOptimizing(true)
    setTimeout(() => {
      setIsOptimizing(false)
      setOptimized(true)
      toast({
        title: 'Rota Otimizada',
        description: 'Economia estimada de 18% em tempo e combustível.',
        className: 'bg-[#10c98f] text-white border-none',
      })
    }, 2500)
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">Route Optimizer</h2>
        <p className="text-muted-foreground">
          Cálculo de rotas inteligentes baseado em IA para entregas agrupadas.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <Card className="col-span-1 shadow-sm flex flex-col">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center font-serif">
              <Zap className="mr-2 h-5 w-5 text-amber-500" /> Parâmetros de Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <span className="field-label">Pontos de Parada</span>
              {addresses.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-md text-sm font-medium"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${optimized ? 'bg-[#10c98f]' : 'bg-primary'}`}
                  >
                    {optimized ? index + 1 : '-'}
                  </div>
                  {item.addr}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <span className="field-label">Estatísticas Estimadas</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Distância</div>
                  <div className="text-xl font-bold font-mono">
                    {optimized ? '12.4' : '15.8'} km
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Tempo</div>
                  <div className="text-xl font-bold font-mono">{optimized ? '45' : '58'} min</div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t bg-muted/20">
            <Button
              className={`w-full h-12 text-base font-bold ${isOptimizing ? 'animate-pulse-subtle' : ''}`}
              onClick={handleOptimize}
              disabled={isOptimizing || optimized}
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Calculando Algoritmo...
                </>
              ) : optimized ? (
                <>
                  <Navigation className="mr-2 h-4 w-4" /> Iniciar Navegação
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Otimizar Agora
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 shadow-sm overflow-hidden bg-muted/30 border-2 border-dashed relative flex items-center justify-center">
          {/* Mock Map Interface */}
          <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/600?q=map%20roads&color=gray')] opacity-20 bg-cover bg-center" />

          {isOptimizing && (
            <div className="relative z-10 bg-background/90 p-6 rounded-xl shadow-xl border flex flex-col items-center">
              <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="font-serif text-xl font-bold">Analisando Tráfego...</h3>
            </div>
          )}

          {!isOptimizing && optimized && (
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="bg-[#10c98f] text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Rota Otimizada com Sucesso
              </div>
              {/* Decorative dots simulating route */}
              <div className="flex items-center gap-4 mt-8">
                <MapPin className="text-primary h-8 w-8" />
                <div className="w-16 h-1 border-b-2 border-dashed border-[#10c98f]" />
                <MapPin className="text-[#10c98f] h-8 w-8" />
                <div className="w-16 h-1 border-b-2 border-dashed border-[#10c98f]" />
                <MapPin className="text-[#10c98f] h-8 w-8" />
              </div>
            </div>
          )}

          {!isOptimizing && !optimized && (
            <div className="relative z-10 flex flex-col items-center text-muted-foreground">
              <Map className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium">Aguardando comando de otimização</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
import { CheckCircle2 } from 'lucide-react'
