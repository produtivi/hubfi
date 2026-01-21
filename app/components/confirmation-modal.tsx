'use client'

import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/base/buttons/button'

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
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-destructive/10 rounded-full">
              {type === 'activate' ? (
                <Eye className="w-5 h-5 text-destructive" />
              ) : (
                <EyeOff className="w-5 h-5 text-destructive" />
              )}
            </div>
            <h3 className="text-title font-semibold">{title}</h3>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <p 
            className="text-body text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            color="secondary"
            size="md"
            onClick={onClose}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            color="primary-destructive"
            size="md"
            iconLeading={type === 'activate' ? Eye : EyeOff}
            onClick={onConfirm}
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}