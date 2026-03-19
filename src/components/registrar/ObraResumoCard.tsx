export function ObraResumoCard({ separacao }: any) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <h3 className="font-bold text-lg">{separacao.cliente}</h3>
      <p className="text-muted-foreground text-sm">{separacao.endereco}</p>
    </div>
  )
}
