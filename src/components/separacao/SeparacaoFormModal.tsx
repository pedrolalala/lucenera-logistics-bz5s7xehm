import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Package,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Flame,
  Truck,
  Box,
  Store,
  Mail,
  AlertTriangle,
  ClipboardList,
  FileText,
  Paperclip,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const RCard = ({ sel, onClick, icon: Icon, title, desc, color }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex flex-1 items-start p-3 border rounded-lg text-left gap-3 transition-all',
      sel ? color : 'border-border hover:bg-muted',
    )}
  >
    <Icon
      className={cn('w-5 h-5 shrink-0 mt-0.5', sel ? 'text-current' : 'text-muted-foreground')}
    />
    <div>
      <div className="font-semibold text-sm leading-tight">{title}</div>
      <div className="text-xs opacity-70 mt-0.5">{desc}</div>
    </div>
  </button>
)

export function SeparacaoFormModal({ isOpen, onClose, onSuccess, editData }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [d, setD] = useState({
    tipo: 'normal',
    cod: '',
    data: undefined as Date | undefined,
    venda: '',
    parcial: '',
    solic: '',
    gestora: '',
    hora: 'flexible',
    cli: '',
    resp: '',
    tel: '',
    end: '',
    comp: '',
    forma: '',
    obs: '',
    gar: false,
    mat: 'sem',
  })

  useEffect(() => {
    if (editData && isOpen) {
      setD({
        tipo: editData.tipo_pedido || 'normal',
        cod: String(editData.codigo_obra || ''),
        data: editData.data_entrega ? new Date(editData.data_entrega) : undefined,
        venda: (editData.numero_venda || []).join(', '),
        parcial: (editData.separacoes_parciais || []).join(', '),
        solic: editData.solicitante || '',
        gestora: editData.gestora_equipe || '',
        hora: editData.delivery_type || 'flexible',
        cli: editData.cliente || '',
        resp: editData.responsavel_recebimento || '',
        tel: editData.telefone || '',
        end: editData.endereco || '',
        comp: editData.nivel_complexidade || '',
        forma: editData.tipo_entrega || '',
        obs: editData.observacoes_internas || '',
        gar: editData.inclui_garantia || false,
        mat: editData.material_tipo || 'sem',
      })
    } else if (isOpen) {
      setD({
        tipo: 'normal',
        cod: '',
        data: undefined,
        venda: '',
        parcial: '',
        solic: '',
        gestora: '',
        hora: 'flexible',
        cli: '',
        resp: '',
        tel: '',
        end: '',
        comp: '',
        forma: '',
        obs: '',
        gar: false,
        mat: 'sem',
      })
    }
  }, [editData, isOpen])

  const missing = []
  if (!d.cod) missing.push('Código da Obra')
  if (!d.venda) missing.push('Nº da Venda')
  if (!d.gestora) missing.push('Gestora')
  if (!d.cli) missing.push('Cliente')
  if (!d.resp) missing.push('Responsável')
  if (!d.end) missing.push('Endereço')
  if (!d.data) missing.push('Data')
  if (!d.comp) missing.push('Complexidade')
  if (!d.forma) missing.push('Forma Entrega')

  const handleSubmit = async () => {
    if (missing.length > 0) return
    setLoading(true)
    try {
      const payload = {
        tipo_pedido: d.tipo,
        codigo_obra: parseInt(d.cod) || null,
        data_entrega: d.data ? format(d.data, 'yyyy-MM-dd') : null,
        numero_venda: d.venda
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        separacoes_parciais: d.parcial ? d.parcial.split(',').map((s) => s.trim()) : null,
        solicitante: d.solic || null,
        gestora_equipe: d.gestora,
        delivery_type: d.hora,
        cliente: d.cli,
        responsavel_recebimento: d.resp,
        telefone: d.tel || null,
        endereco: d.end,
        nivel_complexidade: d.comp,
        tipo_entrega: d.forma,
        observacoes_internas: d.obs || null,
        inclui_garantia: d.gar,
        material_tipo: d.mat === 'sem' ? null : d.mat,
        status: editData ? editData.status : 'material_solicitado',
      }
      if (editData) await supabase.from('separacoes').update(payload).eq('id', editData.id)
      else await supabase.from('separacoes').insert(payload)
      toast({ title: 'Sucesso!', className: 'bg-success text-white border-none' })
      onSuccess()
      onClose()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editData ? 'Editar Separação' : 'Nova Separação'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-bold">Tipo de Pedido *</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <RCard
                sel={d.tipo === 'normal'}
                onClick={() => setD({ ...d, tipo: 'normal' })}
                icon={Package}
                title="Pedido Normal"
                desc="Separação padrão com todos os campos obrigatórios"
                color="border-primary bg-primary/5 text-primary ring-1 ring-primary"
              />
              <RCard
                sel={d.tipo === 'garantia'}
                onClick={() => setD({ ...d, tipo: 'garantia' })}
                icon={ShieldCheck}
                title="Entrega de Garantia"
                desc="Anos anteriores — nº venda, responsável e endereço opcionais"
                color="border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-bold border-b pb-1 border-border block">
              Dados do Pedido
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">CÓDIGO DA OBRA *</Label>
                <Input
                  placeholder="Ex: 26001"
                  value={d.cod}
                  onChange={(e) => setD({ ...d, cod: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">DATA DE ENTREGA *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start font-normal',
                        !d.data && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {d.data ? format(d.data, 'dd/MM/yyyy') : 'dd/mm/aaaa'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[60]">
                    <Calendar
                      mode="single"
                      selected={d.data}
                      onSelect={(x) => setD({ ...d, data: x })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">
                  NÚMEROS DA VENDA *
                </Label>
                <Input
                  placeholder="Digite o número da venda"
                  value={d.venda}
                  onChange={(e) => setD({ ...d, venda: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">SEPARAÇÃO PARCIAL</Label>
                <Input
                  placeholder="Digite o código parcial"
                  value={d.parcial}
                  onChange={(e) => setD({ ...d, parcial: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">
                  SOLICITANTE (OPCIONAL)
                </Label>
                <Input
                  placeholder="Quem solicitou a separação"
                  value={d.solic}
                  onChange={(e) => setD({ ...d, solic: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">
                  GESTORA DA EQUIPE *
                </Label>
                <Select value={d.gestora} onValueChange={(v) => setD({ ...d, gestora: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a gestora..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thais Gomes">Thais Gomes</SelectItem>
                    <SelectItem value="Roberta Battolo">Roberta Battolo</SelectItem>
                    <SelectItem value="Matheus">Matheus</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold">HORÁRIO DE ENTREGA *</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <RCard
                sel={d.hora === 'flexible'}
                onClick={() => setD({ ...d, hora: 'flexible' })}
                icon={Box}
                title="Flexível"
                desc="Pode entregar a qualquer horário do dia"
                color="border-primary bg-primary/5 text-primary ring-1 ring-primary"
              />
              <RCard
                sel={d.hora === 'scheduled'}
                onClick={() => setD({ ...d, hora: 'scheduled' })}
                icon={Box}
                title="Hora Marcada"
                desc="Cliente tem horário específico"
                color="border-primary bg-primary/5 text-primary ring-1 ring-primary"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-bold border-b pb-1 border-border block">
              Informações do Cliente
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">CLIENTE *</Label>
                <Input
                  placeholder="Nome completo ou razão social"
                  value={d.cli}
                  onChange={(e) => setD({ ...d, cli: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">
                  RESPONSÁVEL NA OBRA *
                </Label>
                <Input
                  placeholder="Nome de quem receberá"
                  value={d.resp}
                  onChange={(e) => setD({ ...d, resp: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">
                  TELEFONE DE CONTATO (OPCIONAL)
                </Label>
                <Input
                  placeholder="(16) 99999-9999"
                  value={d.tel}
                  onChange={(e) => setD({ ...d, tel: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-muted-foreground">
                  ENDEREÇO DE ENTREGA *
                </Label>
                <Textarea
                  placeholder="Rua, número, complemento, bairro, cidade - UF"
                  value={d.end}
                  onChange={(e) => setD({ ...d, end: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold">Nível de Complexidade da Entrega *</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <RCard
                sel={d.comp === 'facil'}
                onClick={() => setD({ ...d, comp: 'facil' })}
                icon={CheckCircle2}
                title="FÁCIL"
                desc="Poucos itens"
                color="border-green-500 bg-green-50 text-green-600 ring-1 ring-green-500"
              />
              <RCard
                sel={d.comp === 'medio'}
                onClick={() => setD({ ...d, comp: 'medio' })}
                icon={Zap}
                title="MÉDIO"
                desc="Volume normal"
                color="border-yellow-500 bg-yellow-50 text-yellow-600 ring-1 ring-yellow-500"
              />
              <RCard
                sel={d.comp === 'dificil'}
                onClick={() => setD({ ...d, comp: 'dificil' })}
                icon={Flame}
                title="DIFÍCIL"
                desc="Grande volume/complexo"
                color="border-red-500 bg-red-50 text-red-600 ring-1 ring-red-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold">Forma de Entrega *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RCard
                sel={d.forma === 'lucenera_entrega'}
                onClick={() => setD({ ...d, forma: 'lucenera_entrega' })}
                icon={Truck}
                title="Lucenera Entrega"
                desc="Equipe realiza a entrega"
                color="border-primary bg-primary/5 text-primary ring-1 ring-primary"
              />
              <RCard
                sel={d.forma === 'transportadora'}
                onClick={() => setD({ ...d, forma: 'transportadora' })}
                icon={Box}
                title="Transportadora"
                desc="Enviado via externa"
                color="border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500"
              />
              <RCard
                sel={d.forma === 'cliente_retira'}
                onClick={() => setD({ ...d, forma: 'cliente_retira' })}
                icon={Store}
                title="Cliente Retira"
                desc="Busca no estoque"
                color="border-green-500 bg-green-50 text-green-600 ring-1 ring-green-500"
              />
              <RCard
                sel={d.forma === 'correios'}
                onClick={() => setD({ ...d, forma: 'correios' })}
                icon={Mail}
                title="Correios/Sedex"
                desc="Envio via Correios"
                color="border-yellow-500 bg-yellow-50 text-yellow-600 ring-1 ring-yellow-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-bold">Observações da Entrega (Opcional)</Label>
            <Textarea
              placeholder="Informações importantes..."
              value={d.obs}
              onChange={(e) => setD({ ...d, obs: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Switch checked={d.gar} onCheckedChange={(v) => setD({ ...d, gar: v })} />
            <div>
              <div className="font-semibold text-sm">Inclui peça de garantia? (Opcional)</div>
              <div className="text-xs text-muted-foreground">
                Marque se esta entrega normal também inclui uma peça de garantia
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold">Material para Separação</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'texto', l: 'Digitar Itens', i: ClipboardList },
                { id: 'pdf', l: 'Extrair PDF', i: FileText },
                { id: 'tabela', l: 'Colar Lista', i: FileText },
                { id: 'arquivos', l: 'Anexar Arquivos', i: Paperclip },
                { id: 'sem', l: 'Sem Material', i: Ban },
              ].map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  variant={d.mat === m.id ? 'default' : 'outline'}
                  onClick={() => setD({ ...d, mat: m.id })}
                  className="flex-1 h-auto py-3 flex-col gap-1 text-xs"
                >
                  <m.i className="w-5 h-5 mb-1" />
                  {m.l}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t pt-4">
          <div className="flex-1 text-sm text-warning flex items-center gap-2">
            {missing.length > 0 && (
              <>
                <AlertTriangle className="w-4 h-4" /> Faltam:{' '}
                <span className="font-medium text-xs sm:text-sm">{missing.join(', ')}</span>
              </>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={missing.length > 0 || loading}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {loading ? 'Salvando...' : editData ? 'Salvar Alterações' : 'Criar Separação'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
