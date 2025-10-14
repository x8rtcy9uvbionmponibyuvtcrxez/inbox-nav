export function OrderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-3xl border border-white/10 bg-white/5/10 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-3 w-32 bg-white/5 rounded"></div>
          </div>
          <div className="h-6 w-16 bg-white/10 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-48 bg-white/5 rounded"></div>
          <div className="h-3 w-36 bg-white/5 rounded"></div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-4 w-20 bg-white/10 rounded"></div>
          <div className="h-4 w-16 bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5/10">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-white/5 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-white/5 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5/10 p-8">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-white/10 rounded"></div>
          <div className="h-4 w-32 bg-white/5 rounded"></div>
          <div className="h-4 w-24 bg-white/5 rounded"></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-white/5 rounded"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-white/5 rounded"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5/10 p-8">
        <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-white/10 bg-white/5/10 p-6">
          <div className="h-4 w-20 bg-white/10 rounded mb-2"></div>
          <div className="h-8 w-16 bg-white/5 rounded"></div>
        </div>
      ))}
    </div>
  );
}
