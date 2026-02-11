'use client';

import { Trash01, XClose } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="max-w-md p-6">
        {/* Close button */}
        {!isDeleting && (
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
            <Trash01 className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Excluir página
          </h2>
        </div>

        {/* Description */}
        <p className="text-body text-muted-foreground mb-6">
          Tem certeza que deseja excluir <strong className="text-foreground">"{pageName}"</strong>? Esta ação não pode ser desfeita.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            color="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
            isDisabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            color="primary-destructive"
            size="lg"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
