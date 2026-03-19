import { Button } from '@/components/ui/button'
export function PhotoUploader({ fotos, onFotosChange }: any) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <p className="field-label mb-2 block">Fotos da Entrega</p>
      <Button variant="outline" className="w-full h-14 border-dashed">
        Adicionar Foto
      </Button>
      <p className="text-xs text-muted-foreground mt-2">{fotos.length} foto(s) anexada(s)</p>
    </div>
  )
}
