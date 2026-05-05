'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  /** When used as a controlled dialog */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When used as a trigger-based dialog (wraps children as a click trigger) */
  children?: React.ReactNode
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  variant?: 'destructive' | 'default'
}

/**
 * Reusable confirmation dialog.
 * Use this before destructive operations like delete.
 * 
 * Supports two usage patterns:
 * 1. Controlled: pass `open` and `onOpenChange` for external state control.
 * 2. Trigger-based: wrap a button as `children` — clicking it opens the dialog.
 */
export function ConfirmDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  title = 'Apakah Anda yakin?',
  description = 'Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  loading = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const handleConfirm = async () => {
    await onConfirm()
    setOpen(false)
  }

  return (
    <>
      {/* Trigger element (children click opens dialog) */}
      {children && (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </span>
      )}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Memproses...' : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
