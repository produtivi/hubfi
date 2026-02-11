'use client';

import { Trash01, XClose } from '@untitledui/icons';
import { Dialog, DialogContent } from './dialog';
import { Button } from '@/components/base/buttons/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded-md transition-colors"
          aria-label="Fechar"
        >
          <XClose className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <Trash01 className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
        </div>

        {/* Description */}
        <p className="text-body text-muted-foreground mb-6">
          {description}
        </p>

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
  );
}
