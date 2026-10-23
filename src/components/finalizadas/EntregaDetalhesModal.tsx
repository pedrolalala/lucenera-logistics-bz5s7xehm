import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PhotoGallery } from '@/components/finalizadas/PhotoGallery'
import { registrarEvento } from '@/lib/logistica'

/** fotos_urls é texto: JSON de caminhos/URLs (às vezes separado por vírgula nos antigos). */
function lerFotos(v: unknown): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  const s = String(v).trim()
  if (!s) return []
  try {
    const j = JSON.parse(s)
    return Array.isArray(j) ? j.filter(Boolean).map(String) : [String(j)]
  } catch {
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  }
}

export function EntregaDetalhesModal({ entrega, open, onClose }: any) {
  const fotos = useMemo(() => lerFotos(entrega?.fotos_urls), [entrega?.fotos_urls])

  if (!entrega) return null

  // Fallback logic for identifier
  const idDisplay = entrega.numero_entrega
    ? entrega.numero_entrega
    : entrega.codigo_obra
      ? `LUC-${String(entrega.codigo_obra).padStart(4, '0')}`
      : 'N/A'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Entrega</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Cliente</p>
            <p className="text-lg font-bold">{entrega.cliente}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">
                Código do Pedido
              </p>
              <p className="font-mono font-bold text-primary">{idDisplay}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Cód. Obra</p>
              <p className="font-mono">{entrega.codigo_obra || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Data da Entrega</p>
              <p>
                {entrega.data_entrega_real
                  ? format(parseISO(entrega.data_entrega_real), 'dd/MM/yyyy', { locale: ptBR })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Gestora</p>
              <p className="font-medium text-foreground">{entrega.gestora_equipe || 'N/A'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Endereço</p>
            <p>{entrega.endereco || 'N/A'}</p>
          </div>
          {/* SPEC-226 E2: com quem foi combinado x quem recebeu de fato x quem levou */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Combinado com</p>
              <p className="font-medium">{entrega.combinado_com || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Recebido por</p>
              <p className="font-medium">{entrega.recebido_por || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Entregue por</p>
              <p className="font-medium">{entrega.entregue_por || '—'}</p>
            </div>
          </div>
          {entrega.observacoes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase">Observações</p>
              <p className="text-sm bg-muted p-3 rounded-md mt-1">{entrega.observacoes}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase mb-2">
              Documento assinado e fotos ({fotos.length})
            </p>
            {fotos.length > 0 ? (
              <>
                <PhotoGallery
                  photos={fotos}
                  onOpen={() =>
                    registrarEvento('abriu_documento', entrega.separacao_id || null, `Fotos da entrega ${idDisplay}`)
                  }
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Clique na foto para ampliar. Use + / − ou a roda do mouse para dar zoom e arraste
                  para mover.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma foto registrada.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
