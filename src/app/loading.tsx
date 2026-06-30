// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🥤</div>
        <p className="font-headline font-bold text-xl uppercase text-primary animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}
