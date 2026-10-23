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
  FileText,
  Paperclip,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { enviarArquivo } from '@/lib/logistica'

// Gestoras que já aparecem nas solicitações (o valor gravado é o nome)
const GESTORAS = ['Marina Pousa', 'Thais Gomes', 'Thairine Silva', 'Roberta Battolo', 'Matheus', 'Outro']

type Anexo = { file: File; categoria: 'geral' | 'orcamento_devolucao' }

function EscolherArquivos({
  label,
  onAdd,
}: {
  label: string
  onAdd: (files: File[]) => void
}) {
  return (
    <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed rounded-md text-sm cursor-pointer hover:bg-muted">
      <Paperclip className="w-4 h-4" /> {label}
      <input
        type="file"
        multiple
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          onAdd(Array.from(e.target.files || []))
          e.target.value = ''
        }}
      />
    </label>
  )
}

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
    garDet: '',
    garPeca: '',
    dev: false,
    devDet: '',
    mat: 'sem',
  })
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const isReenvio = editData?.status === 'recusado'

  useEffect(() => {
    setAnexos([])
    if (editData && isOpen) {
      setD({
        tipo: editData.tipo_pedido || 'normal',
        cod: String(editData.codigo_obra || ''),
        // data_entrega é 'yyyy-MM-dd': new Date() leria em UTC e voltaria 1 dia
        data: editData.data_entrega
          ? new Date(`${String(editData.data_entrega).split('T')[0]}T12:00:00`)
          : undefined,
        venda: Array.isArray(editData.numero_venda)
          ? editData.numero_venda.join(', ')
          : String(editData.numero_venda || ''),
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
        garDet: editData.garantia_detalhes || '',
        garPeca: editData.garantia_peca || '',
        dev: editData.inclui_devolucao || false,
        devDet: editData.devolucao_detalhes || '',
        mat: editData.material_tipo || 'sem',
      })
    } else if (isOpen) {
      setD({
        tipo: 'normal',
        cod: '',
        data: undefined,
        venda: '',
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
        garDet: '',
        garPeca: '',
        dev: false,
        devDet: '',
        mat: 'sem',
      })
    }
  }, [editData, isOpen])

  const ehGarantia = d.tipo === 'garantia'
  const temGarantia = ehGarantia || d.gar

  // Garantia de anos anteriores: nº venda, responsável e endereço opcionais (como diz o cartão)
  const missing = []
  if (!d.cod) missing.push('Código da Obra')
  if (!d.venda && !ehGarantia) missing.push('Nº da Venda')
  if (!d.gestora) missing.push('Gestora')
  if (!d.cli) missing.push('Cliente')
  if (!d.resp && !ehGarantia) missing.push('Responsável')
  if (!d.end && !ehGarantia) missing.push('Endereço')
  if (!d.data) missing.push('Data')
  if (!d.comp) missing.push('Complexidade')
  if (!d.forma) missing.push('Forma Entrega')
  if (temGarantia && !d.garDet.trim()) missing.push('O que é a garantia')

  const handleSubmit = async () => {
    if (missing.length > 0) return
    setLoading(true)
    try {
      const payload = {
        tipo_pedido: d.tipo,
        // codigo_obra e numero_venda são texto no banco (antes ia número e lista)
        codigo_obra: d.cod.trim() || null,
        numero_entrega:
          editData?.numero_entrega || `LUC-${Math.floor(1000 + Math.random() * 9000).toString()}`,
        data_entrega: d.data ? format(d.data, 'yyyy-MM-dd') : null,
        numero_venda:
          d.venda
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .join(', ') || null,
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
        garantia_detalhes: temGarantia ? d.garDet.trim() || null : null,
        garantia_peca: temGarantia ? d.garPeca.trim() || null : null,
        inclui_devolucao: d.dev,
        devolucao_detalhes: d.dev ? d.devDet.trim() || null : null,
        material_tipo: anexos.length > 0 ? 'arquivos' : d.mat === 'sem' ? null : d.mat,
        // SPEC-226 C3: recusado corrigido volta para a fila do estoque
        status: editData
          ? isReenvio
            ? 'material_solicitado'
            : editData.status
          : 'material_solicitado',
      }
      let id: string = editData?.id
      if (editData) {
        const { error } = await supabase.from('separacoes').update(payload as any).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('separacoes')
          .insert(payload as any)
          .select('id')
          .single()
        if (error) throw error
        id = data.id
      }

      if (anexos.length > 0) {
        const { count } = await supabase
          .from('separacao_arquivos')
          .select('id', { count: 'exact', head: true })
          .eq('separacao_id', id)
        const linhas = []
        for (let i = 0; i < anexos.length; i++) {
          const a = anexos[i]
          const caminho = await enviarArquivo('materiais-separacao', d.cod, a.file, i)
          linhas.push({
            separacao_id: id,
            nome_arquivo: a.file.name,
            tipo_arquivo: a.file.type === 'application/pdf' ? 'pdf' : 'imagem',
            url_arquivo: caminho,
            tamanho_bytes: a.file.size,
            ordem: (count || 0) + i,
            categoria: a.categoria,
          })
        }
        const { error } = await supabase.from('separacao_arquivos').insert(linhas as any)
        if (error) throw error
      }

      toast({
        title: isReenvio ? 'Solicitação reenviada!' : 'Sucesso!',
        className: 'bg-success text-white border-none',
      })
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
            {isReenvio ? 'Corrigir e reenviar' : editData ? 'Editar Separação' : 'Nova Separação'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {isReenvio && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-bold">Recusado pelo estoque:</span> {editData.motivo_recusa}
              <br />
              Corrija o que for preciso e clique em <b>Reenviar</b> — volta para Solicitado.
            </div>
          )}
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
                color="border-yellow-500 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500"
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
                    {[...GESTORAS, ...(d.gestora && !GESTORAS.includes(d.gestora) ? [d.gestora] : [])].map(
                      (g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ),
                    )}
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
          {/* SPEC-226 B: na mesma visita pode ir entrega + garantia + retirada de devolução */}
          {!ehGarantia && (
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch checked={d.gar} onCheckedChange={(v) => setD({ ...d, gar: v })} />
              <div>
                <div className="font-semibold text-sm">Inclui peça de garantia?</div>
                <div className="text-xs text-muted-foreground">
                  Marque se esta entrega também leva uma peça de garantia
                </div>
              </div>
            </div>
          )}
          {temGarantia && (
            <div className="space-y-3 p-3 border-2 border-yellow-400 bg-yellow-50/60 rounded-lg">
              <div className="font-semibold text-sm text-yellow-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Garantia (aparece no cartão e na impressão)
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">
                  O QUE É A GARANTIA *
                </Label>
                <Textarea
                  placeholder="Ex.: troca do driver do embutido da sala, levar peça nova e trazer a com defeito"
                  value={d.garDet}
                  onChange={(e) => setD({ ...d, garDet: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">PEÇA (OPCIONAL)</Label>
                <Input
                  placeholder="Código / descrição da peça"
                  value={d.garPeca}
                  onChange={(e) => setD({ ...d, garPeca: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Switch checked={d.dev} onCheckedChange={(v) => setD({ ...d, dev: v })} />
            <div>
              <div className="font-semibold text-sm">Retirar devolução / troca nesta visita?</div>
              <div className="text-xs text-muted-foreground">
                Anexe o orçamento de devolução como guia do que trazer da obra
              </div>
            </div>
          </div>
          {d.dev && (
            <div className="space-y-3 p-3 border-2 border-red-400 bg-red-50/60 rounded-lg">
              <div className="font-semibold text-sm text-red-800 flex items-center gap-2">
                <Undo2 className="w-4 h-4" /> Retirada de devolução
              </div>
              <Textarea
                placeholder="O que retirar (opcional se o orçamento anexado já diz)"
                value={d.devDet}
                onChange={(e) => setD({ ...d, devDet: e.target.value })}
                rows={2}
              />
              <EscolherArquivos
                label="Anexar orçamento de devolução"
                onAdd={(fs) =>
                  setAnexos((prev) => [
                    ...prev,
                    ...fs.map((file) => ({ file, categoria: 'orcamento_devolucao' as const })),
                  ])
                }
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-sm font-bold">Arquivos da separação (lista, PDF da venda, fotos)</Label>
            <EscolherArquivos
              label="Anexar arquivos"
              onAdd={(fs) =>
                setAnexos((prev) => [...prev, ...fs.map((file) => ({ file, categoria: 'geral' as const }))])
              }
            />
            {editData && (
              <p className="text-xs text-muted-foreground">
                Os arquivos já anexados continuam; os novos são somados a eles.
              </p>
            )}
            {anexos.length > 0 && (
              <ul className="space-y-1">
                {anexos.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm border rounded px-2 py-1 bg-muted/30"
                  >
                    {a.categoria === 'orcamento_devolucao' ? (
                      <Undo2 className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span className="flex-1 truncate">{a.file.name}</span>
                    {a.categoria === 'orcamento_devolucao' && (
                      <span className="text-[10px] font-bold text-red-700">ORÇ. DEVOLUÇÃO</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setAnexos((prev) => prev.filter((_, j) => j !== i))}
                      className="text-muted-foreground hover:text-destructive"
                      title="Tirar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              {loading
                ? 'Salvando...'
                : isReenvio
                  ? 'Reenviar'
                  : editData
                    ? 'Salvar Alterações'
                    : 'Criar Separação'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
