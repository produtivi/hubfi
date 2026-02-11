'use client'

import { Eye, EyeOff, XClose } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'activate' | 'deactivate'
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'deactivate',
  isLoading = false
}: ConfirmationModalProps) {
  const Icon = type === 'activate' ? Eye : EyeOff

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-md p-6">
        {/* Close button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-accent rounded-md transition-colors"
            aria-label="Fechar"
          >
            <XClose className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {/* Icon + Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
        </div>

        {/* Description */}
        <p
          className="text-body text-muted-foreground mb-6"
          dangerouslySetInnerHTML={{ __html: message }}
        />

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            color="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            color="primary-destructive"
            size="lg"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
