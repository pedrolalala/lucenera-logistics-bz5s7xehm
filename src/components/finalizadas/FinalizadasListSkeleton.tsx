export function FinalizadasListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
      ))}
    </div>
  )
}
