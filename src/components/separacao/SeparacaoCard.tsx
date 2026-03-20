import { useState } from 'react'
import { Separacao } from '@/hooks/useSeparacoes'
import { StatusSeparacao } from '@/types/separacao'
import { format, parseISO } from 'date-fns'
import {
  MapPin,
  Edit,
  Trash2,
  Check,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Box,
  Package,
  User,
  Phone,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SeparacaoCardProps {
  separacao: Separacao
  onStatusChange: (id: string, status: StatusSeparacao) => void
  onEdit: (separacao: Separacao) => void
  onDelete: (id: string) => void
  isHighlighted?: boolean
  isAdmin?: boolean
}

export function SeparacaoCard({
  separacao,
  onStatusChange,
  onEdit,
  onDelete,
  isHighlighted,
  isAdmin,
}: SeparacaoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isSeparado = separacao.status === 'separado'
  const isSolicitado = separacao.status === 'material_solicitado'

  const borderColor = isSeparado
    ? 'border-l-[#10c98f]'
    : isSolicitado
      ? 'border-l-orange-400'
      : 'border-l-blue-500'

  const complexityConfig = {
    facil: { label: 'FÁCIL', color: 'bg-green-100 text-green-700 border-green-200' },
    medio: { label: 'MÉDIO', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    dificil: { label: 'DIFÍCIL', color: 'bg-red-100 text-red-700 border-red-200' },
  }

  const comp = separacao.nivel_complexidade || 'medio'
  const compData = complexityConfig[comp as keyof typeof complexityConfig] || complexityConfig.medio

  const lucCode =
    separacao.numero_entrega ||
    `LUC-${separacao.codigo_obra?.toString().padStart(4, '0').slice(-4) || '0000'}`

  return (
    <div
      className={cn(
        'bg-card shadow-sm rounded-lg transition-all border border-border border-l-[6px] mb-3',
        borderColor,
        isHighlighted ? 'ring-2 ring-primary' : 'hover:shadow-md',
      )}
    >
      <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left/Middle area */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          {/* Status & Complexity */}
          <div className="flex items-center gap-2 sm:w-[190px] shrink-0">
            {isSeparado ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-[#10c98f] text-[#10c98f] bg-[#10c98f]/10">
                <Check className="w-3.5 h-3.5" /> Separado
              </div>
            ) : isSolicitado ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-orange-400 text-orange-600 bg-orange-50">
                <Package className="w-3.5 h-3.5" /> Solicitado
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border border-blue-500 text-blue-600 bg-blue-50">
                <Box className="w-3.5 h-3.5" /> Separando
              </div>
            )}

            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border',
                compData.color,
              )}
            >
              <Zap className="w-3 h-3 fill-current" /> {compData.label}
            </div>
          </div>

          {/* Title & Info */}
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
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-t-0 border-border pt-3 md:pt-0 mt-2 md:mt-0">
          <span
            className="text-xs text-muted-foreground hidden lg:block truncate max-w-[120px]"
            title={separacao.gestora_equipe}
          >
            {separacao.gestora_equipe}
          </span>

          <div className="flex items-center gap-2">
            {isSeparado ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => onStatusChange(separacao.id, 'em_separacao')}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Voltar
              </Button>
            ) : isSolicitado ? (
              <Button
                size="sm"
                className="h-8 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => onStatusChange(separacao.id, 'em_separacao')}
              >
                <Box className="w-3.5 h-3.5 mr-1.5" /> Iniciar
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 bg-[#10c98f] hover:bg-[#10c98f]/90 text-white"
                onClick={() => onStatusChange(separacao.id, 'separado')}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" /> Finalizar
              </Button>
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

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-border bg-muted/20 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Endereço de Entrega
              </p>
              <p className="text-sm text-foreground leading-relaxed">{separacao.endereco}</p>
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
                  <span className="font-medium">{separacao.numero_venda?.join(', ') || 'N/A'}</span>
                </p>
                <p>
                  Entrega:{' '}
                  <span className="capitalize">
                    {separacao.tipo_entrega?.replace('_', ' ') || 'N/A'}
                  </span>
                </p>
                <p>
                  Tipo: <span className="capitalize">{separacao.tipo_pedido || 'Normal'}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Box className="w-3 h-3" /> Observações
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
        </div>
      )}
    </div>
  )
}
