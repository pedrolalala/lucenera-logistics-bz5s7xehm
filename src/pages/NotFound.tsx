import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <h1 className="text-9xl font-mono font-bold text-primary opacity-20 mb-4 tracking-tighter">
        404
      </h1>
      <h2 className="text-3xl font-serif font-bold tracking-tight mb-4">Rota não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        O manifesto de carga ou a interface que você tentou acessar não existe ou foi movida no
        sistema.
      </p>
      <Button asChild size="lg" className="h-12 px-8 font-semibold">
        <Link to="/">Voltar ao Dashboard</Link>
      </Button>
    </div>
  )
}
