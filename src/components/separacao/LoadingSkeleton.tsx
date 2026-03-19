export function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((section) => (
        <div key={section} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="h-px w-full bg-border" />
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 w-full bg-card animate-pulse rounded-md border border-border shadow-sm"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
