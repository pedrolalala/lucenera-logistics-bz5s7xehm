import { useState } from 'react'
import { Separacao } from '@/hooks/useSeparacoes'
import { StatusSeparacao } from '@/types/separacao'
import { format, parseISO } from 'date-fns'
import {
  MapPin,
  Edit,
  Trash2,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Package,
  User,
  Phone,
  FileText,
  Circle,
  Clock,
  FileCheck,
  Paperclip,
  Printer,
  Ban,
  ShieldCheck,
  Undo2,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SeparacaoFiles } from '@/components/separacao/SeparacaoFiles'
import { SeparacaoItensList } from '@/components/separacao/SeparacaoItensList'
import { TiposPedidoBadges } from '@/components/separacao/TiposPedidoBadges'
import { useToast } from '@/hooks/use-toast'
import { COMPLEXIDADE_LABEL, imprimirSolicitacao, isDevolucao } from '@/lib/logistica'

interface SeparacaoCardProps {
  separacao: Separacao
  onStatusChange: (id: string, status: StatusSeparacao) => void
  onEdit: (separacao: Separacao) => void
  onDelete: (id: string) => void
  onFinalizar: (separacao: Separacao) => void
  onRecusar?: (separacao: Separacao) => void
  isHighlighted?: boolean
  isAdmin?: boolean
}

export function SeparacaoCard({
  separacao,
  onStatusChange,
  onEdit,
  onDelete,
  onFinalizar,
  onRecusar,
  isHighlighted,
  isAdmin,
}: SeparacaoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  // SPEC-226: 'Pronto' (Separação Parcial com a venda 100% separada) conta como separado.
  const isSeparado = separacao.status === 'separado' || separacao.status === 'Pronto'
  const isSolicitado = separacao.status === 'material_solicitado'
  const isRecusado = separacao.status === 'recusado'
  const isGarantia = separacao.tipo_pedido === 'garantia' || separacao.inclui_garantia
  const isDevol = isDevolucao(separacao)
  const deliveryType = separacao.delivery_type || 'flexible'
  const isScheduled = deliveryType === 'scheduled'
  const enderecoDisplay = separacao.endereco_entrega || separacao.endereco || 'N/A'

  let cardBorderClasses = 'border border-border border-l-[6px]'
  if (isRecusado) {
    cardBorderClasses = 'border-dashed border-red-300 border-l-red-600 border-l-[6px]'
  } else if (isDevol) {
    cardBorderClasses = 'border-red-300 border-l-red-500 border-l-[6px]'
  } else if (isGarantia) {
    cardBorderClasses = 'border-yellow-300 border-l-yellow-500 border-l-[6px]'
  } else if (isSeparado) {
    cardBorderClasses = 'border-border border-l-[#10c98f] border-l-[6px]'
  } else if (isSolicitado) {
    cardBorderClasses = 'border-border border-l-purple-500 border-l-[6px]'
  } else {
    cardBorderClasses = 'border-border border-l-blue-500 border-l-[6px]'
  }

  // SPEC-226 A6: complexidade escrita por extenso (Fácil / Médio / Complexo)
  const complexityConfig = {
    facil: { label: COMPLEXIDADE_LABEL.facil, color: 'bg-green-100 text-green-700 border-green-200' },
    medio: { label: COMPLEXIDADE_LABEL.medio, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    dificil: { label: COMPLEXIDADE_LABEL.dificil, color: 'bg-red-100 text-red-700 border-red-200' },
  }

  const comp = separacao.nivel_complexidade || 'medio'
  const compData = complexityConfig[comp as keyof typeof complexityConfig] || complexityConfig.medio

  const lucCode =
    separacao.numero_entrega ||
    `LUC-${separacao.codigo_obra?.toString().padStart(4, '0').slice(-4) || '0000'}`

  return (
    <div
      onDoubleClick={() => onEdit(separacao)}
      className={cn(
        'bg-card shadow-sm rounded-lg transition-all mb-3 cursor-pointer',
        cardBorderClasses,
        isHighlighted ? 'ring-2 ring-primary' : 'hover:shadow-md',
      )}
    >
      <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 shrink-0 md:max-w-[320px]">
            {isRecusado ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-red-600 text-red-700 bg-red-50">
                <Ban className="w-3.5 h-3.5" /> Recusado
              </div>
            ) : isSeparado ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-[#10c98f] text-[#10c98f] bg-[#10c98f]/10">
                <Check className="w-3.5 h-3.5" /> Separado
              </div>
            ) : isSolicitado ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-purple-500 text-purple-600 bg-purple-50">
                <Package className="w-3.5 h-3.5" /> Solicitado
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-blue-500 text-blue-600 bg-blue-50">
                <RotateCcw className="w-3.5 h-3.5" /> Em Separação
              </div>
            )}
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border',
                compData.color,
              )}
            >
              <Circle className="w-2.5 h-2.5 fill-current" /> {compData.label}
            </div>
            <TiposPedidoBadges separacao={separacao} />
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-border text-muted-foreground bg-muted">
              <Clock className="w-3 h-3" />
              {isScheduled
                ? `Hora marcada${separacao.scheduled_time ? ` ${separacao.scheduled_time.slice(0, 5)}` : ''}`
                : 'Flexível'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-foreground text-sm uppercase truncate"
              title={separacao.cliente}
            >
              {separacao.cliente}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1.5">
              <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                {lucCode}
              </span>
              <span>Obra: {separacao.codigo_obra}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {separacao.data_entrega ? format(parseISO(separacao.data_entrega), 'dd/MM/yy') : ''}
              </span>
              <span
                className="flex items-center gap-1 truncate max-w-[200px]"
                title={enderecoDisplay}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {enderecoDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-t-0 border-border pt-3 md:pt-0 mt-2 md:mt-0">
          <span
            className="text-xs text-muted-foreground hidden lg:block truncate max-w-[120px]"
            title={separacao.gestora_equipe}
          >
            {separacao.gestora_equipe}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              title="Imprimir esta solicitação"
              onClick={() => {
                imprimirSolicitacao(separacao).catch((err) =>
                  toast({ title: 'Erro ao imprimir', description: err.message, variant: 'destructive' }),
                )
              }}
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>
            {isRecusado ? (
              <Button size="sm" className="h-8" onClick={() => onEdit(separacao)}>
                <Send className="w-3.5 h-3.5 mr-1.5" /> Corrigir e reenviar
              </Button>
            ) : isSeparado ? (
              <>
                <Button
                  size="sm"
                  className="h-8 bg-success hover:bg-success-dark text-success-foreground"
                  onClick={() => onFinalizar(separacao)}
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Finalizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => onStatusChange(separacao.id, 'Em separação')}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Voltar
                </Button>
              </>
            ) : isSolicitado ? (
              <>
                {onRecusar && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => onRecusar(separacao)}
                  >
                    <Ban className="w-3.5 h-3.5 mr-1.5" /> Recusar
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-8 bg-[#10c98f] hover:bg-[#10c98f]/90 text-white"
                  onClick={() => onStatusChange(separacao.id, 'Em separação')}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Iniciar Separação
                </Button>
              </>
            ) : (
              <>
                {onRecusar && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => onRecusar(separacao)}
                  >
                    <Ban className="w-3.5 h-3.5 mr-1.5" /> Recusar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => onStatusChange(separacao.id, 'material_solicitado')}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Voltar
                </Button>
                <Button
                  size="sm"
                  className="h-8 bg-[#10c98f] hover:bg-[#10c98f]/90 text-white"
                  onClick={() => onStatusChange(separacao.id, 'separado')}
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Separado
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-foreground px-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              Detalhes{' '}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* SPEC-226 A3/B2/C: garantia, devolução e motivo da recusa sempre à vista, sem abrir Editar */}
      {(isRecusado || isGarantia || isDevol) && (
        <div className="px-4 pb-3 space-y-2 empty:hidden">
          {isRecusado && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-bold">Recusado</span>
              {separacao.recusado_por_nome ? ` por ${separacao.recusado_por_nome}` : ''}
              {separacao.recusado_em
                ? ` em ${format(parseISO(separacao.recusado_em), 'dd/MM HH:mm')}`
                : ''}
              : {separacao.motivo_recusa}
            </div>
          )}
          {isGarantia &&
            (separacao.garantia_detalhes || separacao.garantia_peca || separacao.garantia_motivo) && (
              <div className="rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                <span className="font-bold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Garantia:
                </span>{' '}
                {[
                  separacao.garantia_detalhes,
                  separacao.garantia_peca && `Peça: ${separacao.garantia_peca}`,
                  separacao.garantia_motivo && `Motivo: ${separacao.garantia_motivo}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            )}
          {isDevol && (
            <div className="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-900">
              <span className="font-bold inline-flex items-center gap-1">
                <Undo2 className="w-3.5 h-3.5" /> Retirar devolução:
              </span>{' '}
              {separacao.devolucao_detalhes || 'ver orçamento de devolução anexado'}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-border bg-muted/20 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Endereço de Entrega
              </p>
              <p className="text-sm text-foreground leading-relaxed">{enderecoDisplay}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <User className="w-3 h-3" /> Responsável
              </p>
              <p className="text-sm text-foreground">
                {separacao.responsavel_recebimento || 'Não informado'}
              </p>
              {separacao.telefone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Phone className="w-3 h-3" /> {separacao.telefone}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Detalhes do Pedido
              </p>
              <div className="text-sm text-foreground space-y-1">
                <p>
                  Nº Venda:{' '}
                  <span className="font-medium">
                    {/* Fix: numero_venda é `text` no banco (não array) para
                        separações vindas da Separação Parcial — .join()
                        quebrava a tela inteira nesses casos. */}
                    {/* SPEC-182 (N1): número sem prefixo VENDA-/ORC-. */}
                    {String(
                      Array.isArray(separacao.numero_venda)
                        ? separacao.numero_venda.join(', ')
                        : separacao.numero_venda || 'N/A',
                    ).replace(/\b(VENDA|ORC)-(\d)/gi, '$2')}
                  </span>
                </p>
                <p>
                  Entrega:{' '}
                  <span className="capitalize">
                    {separacao.tipo_entrega?.replace('_', ' ') || 'N/A'}
                  </span>
                </p>
                <p>
                  Solicitante: <span className="font-medium">{separacao.solicitante || '—'}</span>
                </p>
                <p>
                  Pedido em:{' '}
                  {separacao.created_at
                    ? format(parseISO(separacao.created_at), 'dd/MM/yy HH:mm')
                    : '—'}
                </p>
              </div>
            </div>
            <div className="space-y-1.5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Observações
                </p>
                <p className="text-sm text-foreground line-clamp-3">
                  {separacao.observacoes_internas || 'Nenhuma observação.'}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(separacao)}
                  className="h-8 gap-1.5 bg-card"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(separacao.id)}
                    className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/20 bg-card"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
              <Package className="w-3 h-3" /> Peças desta separação
            </p>
            <SeparacaoItensList separacaoId={separacao.id} />
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
              <Paperclip className="w-3 h-3" /> Arquivos Anexados
            </p>
            <SeparacaoFiles separacaoId={separacao.id} />
          </div>
        </div>
      )}
    </div>
  )
}
