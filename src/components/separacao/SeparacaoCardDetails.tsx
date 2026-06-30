import { Separacao } from '@/hooks/useSeparacoes'
import { MapPin, Edit, Trash2, User, Phone, FileText, Box, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeparacaoFiles } from './SeparacaoFiles'

interface SeparacaoCardDetailsProps {
  separacao: Separacao
  onEdit: (separacao: Separacao) => void
  onDelete: (id: string) => void
  isAdmin?: boolean
}

export function SeparacaoCardDetails({
  separacao,
  onEdit,
  onDelete,
  isAdmin,
}: SeparacaoCardDetailsProps) {
  const enderecoDisplay = separacao.endereco_entrega || separacao.endereco || 'N/A'

  const renderMaterialConteudo = () => {
    const mc = separacao.material_conteudo as unknown
    if (!mc) return 'Nenhum material informado.'
    if (typeof mc === 'string') return mc
    if (typeof mc === 'object') {
      try {
        return JSON.stringify(mc, null, 2)
      } catch {
        return String(mc)
      }
    }
    return String(mc)
  }

  return (
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
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5">
          <Package className="w-3 h-3" /> Material para Separação
        </p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{renderMaterialConteudo()}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
          <FileText className="w-3 h-3" /> Arquivos Anexados
        </p>
        <SeparacaoFiles separacaoId={separacao.id} />
      </div>
    </div>
  )
}
