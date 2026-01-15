'use client'

import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react'

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

  const getIcon = () => {
    return type === 'activate' ? (
      <Eye className="w-5 h-5 text-white" />
    ) : (
      <EyeOff className="w-5 h-5 text-white" />
    )
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
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-body border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                {getIcon()}
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}