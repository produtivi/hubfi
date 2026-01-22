'use client';

import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pageName: string;
  isDeleting: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  pageName,
  isDeleting
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-title font-semibold">Confirmar exclusão</h3>
          </div>
          {!isDeleting && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-body text-muted-foreground">
            Tem certeza que deseja excluir a página <strong className="text-foreground">"{pageName}"</strong>? Esta ação não pode ser desfeita e a página será removida permanentemente.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            color="secondary"
            size="md"
            onClick={onClose}
            isDisabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            color="primary-destructive"
            size="md"
            iconLeading={Trash2}
            onClick={onConfirm}
            isDisabled={isDeleting}
            isLoading={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir página'}
          </Button>
        </div>
      </div>
    </div>
  );
}