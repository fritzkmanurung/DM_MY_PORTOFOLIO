'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground text-sm">
            {error.message || 'Halaman admin mengalami masalah. Silakan coba lagi.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="gap-2" onClick={() => window.location.href = '/admin'}>
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          <Button className="gap-2" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    </div>
  )
}
