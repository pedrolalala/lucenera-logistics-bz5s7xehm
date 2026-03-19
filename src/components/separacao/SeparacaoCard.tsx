import { Separacao } from '@/hooks/useSeparacoes'
import { StatusSeparacao } from '@/types/separacao'
import { format, parseISO } from 'date-fns'
import { MapPin, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  const isSeparado = separacao.status === 'separado'
  const borderColor = isSeparado ? 'border-l-[#10c98f]' : 'border-l-blue-500'

  return (
    <div
      className={`bg-card shadow-sm rounded-md transition-all border border-border border-l-[6px] ${borderColor} p-4 mb-4 ${isHighlighted ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4 border-b border-border pb-4">
        <div>
          <p className="field-label">Cliente</p>
          <h3 className="field-value text-lg font-bold text-primary font-serif">
            {separacao.cliente}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              isSeparado
                ? 'bg-[#10c98f] hover:bg-[#10c98f]/90 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          >
            {isSeparado ? 'Separado' : 'Separando'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="field-label">Cód Obra</p>
          <p className="field-value font-mono text-muted-foreground">{separacao.codigo_obra}</p>
        </div>
        <div>
          <p className="field-label">Pedido</p>
          <p className="field-value font-mono text-muted-foreground">
            {separacao.numero_venda?.join(', ') || 'N/A'}
          </p>
        </div>
        <div>
          <p className="field-label">Data Entrega</p>
          <p className="field-value font-medium">
            {format(parseISO(separacao.data_entrega), 'dd/MM/yyyy')}
          </p>
        </div>
        <div>
          <p className="field-label">Complexidade</p>
          <p className="field-value capitalize">{separacao.nivel_complexidade || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="field-label flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Endereço
        </p>
        <p className="field-value">{separacao.endereco}</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-border">
        {!isSeparado ? (
          <Button
            onClick={() => onStatusChange(separacao.id, 'separado')}
            className="bg-[#10c98f] hover:bg-[#10c98f]/90 text-white font-medium"
          >
            Marcar como Separado
          </Button>
        ) : (
          <Button onClick={() => onStatusChange(separacao.id, 'em_separacao')} variant="outline">
            Voltar para Separando
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={() => onEdit(separacao)}>
          <Edit className="w-4 h-4 text-muted-foreground" />
        </Button>

        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(separacao.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
