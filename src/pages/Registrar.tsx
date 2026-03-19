import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Box, User, Truck, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Registrar() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errorField, setErrorField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const client = (form.elements.namedItem('client') as HTMLInputElement).value

    if (!client) {
      setErrorField('client')
      setTimeout(() => setErrorField(null), 500)
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: 'Entrega Registrada',
        description: 'Novo ID gerado: LCN-9950. Enviado para separação.',
        className: 'bg-[#10c98f] text-white border-none',
      })
      form.reset()
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold tracking-tight mb-2">
          Registrar Nova Entrega
        </h2>
        <p className="text-muted-foreground">
          Insira os dados do pedido para iniciar o fluxo logístico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-serif">
              <User className="mr-2 h-5 w-5" /> Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="field-label">
                  Razão Social / Nome
                </Label>
                <Input
                  id="client"
                  name="client"
                  className={cn(errorField === 'client' && 'border-destructive animate-shake')}
                  placeholder="Ex: Hospital Santa Cruz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="field-label">
                  CNPJ / Documento
                </Label>
                <Input id="cnpj" placeholder="00.000.000/0000-00" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="field-label flex items-center">
                <MapPin className="mr-1 w-3 h-3" /> Endereço Completo
              </Label>
              <Input id="address" placeholder="Rua, Número, Bairro, Cidade - UF" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-serif">
                <Box className="mr-2 h-5 w-5" /> Itens e Carga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume" className="field-label">
                    Volumes (Caixas)
                  </Label>
                  <Input id="volume" type="number" min="1" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="field-label">
                    Peso Total (kg)
                  </Label>
                  <Input id="weight" type="number" step="0.1" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs" className="field-label">
                  Observações de Manuseio
                </Label>
                <Textarea
                  id="obs"
                  placeholder="Ex: Carga frágil, manter refrigerado..."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-serif">
                <Truck className="mr-2 h-5 w-5" /> Logística
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deadline" className="field-label">
                  Prazo de Entrega Máximo
                </Label>
                <Input id="deadline" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="field-label">
                  Nível de Prioridade
                </Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="normal">Normal</option>
                  <option value="high">Alta (Urgente)</option>
                  <option value="critical">Crítica (Emergência Médica)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" className="mr-4">
            Cancelar
          </Button>
          <Button type="submit" className="min-w-[200px] h-12 text-lg font-bold" disabled={loading}>
            {loading ? 'Processando...' : 'Gerar Rastreio e Iniciar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
