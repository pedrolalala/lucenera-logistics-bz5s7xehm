import { useEffect, useMemo, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhotoUploaderProps {
  fotos: File[]
  onFotosChange: (fotos: File[]) => void
}

export function PhotoUploader({ fotos, onFotosChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Miniaturas locais; liberadas quando a lista muda ou a tela fecha.
  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  const handleSelecionar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novas = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
    if (novas.length > 0) onFotosChange([...fotos, ...novas])
    // Permite escolher o mesmo arquivo de novo depois de remover.
    e.target.value = ''
  }

  const remover = (index: number) => onFotosChange(fotos.filter((_, i) => i !== index))

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <p className="field-label mb-2 block">Fotos da Entrega</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelecionar}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-14 border-dashed"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-5 w-5 mr-2" />
        Adicionar Foto
      </Button>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remover(i)}
                aria-label={`Remover foto ${i + 1}`}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">{fotos.length} foto(s) anexada(s)</p>
    </div>
  )
}
