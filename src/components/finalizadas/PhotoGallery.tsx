import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useSignedUrls } from '@/hooks/useSignedUrls'

interface PhotoGalleryProps {
  photos: string[]
  maxVisible?: number
  onOpen?: (index: number) => void
}

const ZOOM_MIN = 1
const ZOOM_MAX = 6

export function PhotoGallery({ photos, maxVisible = 8, onOpen }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Generate signed URLs for all photos
  const { signedUrls, isLoading } = useSignedUrls(photos, 'entregas-fotos')

  const displayPhotos = signedUrls.length > 0 ? signedUrls : photos
  const visiblePhotos = displayPhotos.slice(0, maxVisible)
  const remainingCount = displayPhotos.length - maxVisible

  // SPEC-226 F1: zoom (botões, roda do mouse, duplo clique, pinça no celular) e arrastar
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const arraste = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const toques = useRef(new Map<number, { x: number; y: number }>())
  const pinca = useRef<{ dist: number; zoom: number } | null>(null)

  useEffect(() => {
    setZoom(1)
    setPos({ x: 0, y: 0 })
  }, [selectedIndex])

  const aplicarZoom = (z: number) => {
    const novo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
    setZoom(novo)
    if (novo === 1) setPos({ x: 0, y: 0 })
  }

  const abrir = (index: number) => {
    setSelectedIndex(index)
    onOpen?.(index)
  }

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? displayPhotos.length - 1 : selectedIndex - 1)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === displayPhotos.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setSelectedIndex(null)
    if (e.key === '+' || e.key === '=') aplicarZoom(zoom + 0.5)
    if (e.key === '-') aplicarZoom(zoom - 0.5)
    if (e.key === '0') aplicarZoom(1)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (toques.current.size === 2) {
      const [a, b] = Array.from(toques.current.values())
      pinca.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
      arraste.current = null
    } else if (zoom > 1) {
      arraste.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!toques.current.has(e.pointerId)) return
    toques.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinca.current && toques.current.size === 2) {
      const [a, b] = Array.from(toques.current.values())
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      aplicarZoom(pinca.current.zoom * (dist / pinca.current.dist))
      return
    }
    if (arraste.current) {
      setPos({
        x: arraste.current.px + (e.clientX - arraste.current.x),
        y: arraste.current.py + (e.clientY - arraste.current.y),
      })
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    toques.current.delete(e.pointerId)
    if (toques.current.size < 2) pinca.current = null
    if (toques.current.size === 0) arraste.current = null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando fotos...</span>
      </div>
    )
  }

  if (displayPhotos.length === 0) {
    return null
  }

  const botao =
    'p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors text-background'

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visiblePhotos.map((photo, index) => (
          <button
            key={index}
            onClick={() => abrir(index)}
            className="relative aspect-square rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={photo}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                // Fallback if signed URL fails
                const target = e.target as HTMLImageElement
                target.src = '/placeholder.svg'
              }}
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
          </button>
        ))}

        {remainingCount > 0 && (
          <button
            onClick={() => abrir(maxVisible)}
            className="aspect-square rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span className="text-lg font-semibold text-muted-foreground">
              +{remainingCount} fotos
            </span>
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent
          className="max-w-[98vw] max-h-[98vh] p-0 bg-foreground/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-[92vh] flex items-center justify-center overflow-hidden">
            {/* Barra de cima: contador, zoom, baixar, fechar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2">
              <span className="text-background text-sm font-medium mr-auto">
                {selectedIndex !== null && `${selectedIndex + 1} / ${displayPhotos.length}`}
              </span>
              <button onClick={() => aplicarZoom(zoom - 0.5)} className={botao} title="Diminuir (-)">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-background text-xs w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => aplicarZoom(zoom + 0.5)} className={botao} title="Aumentar (+)">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={() => aplicarZoom(1)} className={botao} title="Tamanho da tela (0)">
                <Maximize2 className="w-5 h-5" />
              </button>
              {selectedIndex !== null && (
                <a
                  href={displayPhotos[selectedIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={botao}
                  title="Abrir original / baixar"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              <button onClick={() => setSelectedIndex(null)} className={botao} title="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation arrows */}
            {displayPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-3 z-10 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-background" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 z-10 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-background" />
                </button>
              </>
            )}

            {/* Image */}
            {selectedIndex !== null && (
              <img
                src={displayPhotos[selectedIndex]}
                alt={`Foto ${selectedIndex + 1}`}
                draggable={false}
                className="max-w-[94vw] max-h-[86vh] object-contain select-none touch-none"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                  transition: arraste.current || pinca.current ? 'none' : 'transform 120ms ease-out',
                  cursor: zoom > 1 ? 'grab' : 'zoom-in',
                }}
                onWheel={(e) => aplicarZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25))}
                onDoubleClick={() => aplicarZoom(zoom > 1 ? 1 : 2.5)}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder.svg'
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
