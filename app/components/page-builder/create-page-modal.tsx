'use client';

import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { PageType, PAGE_TYPES } from '@/types/page-builder';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePage: (type: PageType) => void;
}

export function CreatePageModal({ isOpen, onClose, onCreatePage }: CreatePageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-body font-medium">Qual é o tipo de página que você quer criar?</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => {
              onCreatePage('presell' as PageType);
              onClose();
            }}
            className="w-full flex items-center justify-between px-6 py-3 bg-accent text-foreground rounded-md hover:bg-accent/80 transition-colors text-left"
          >
            <span className="text-body font-medium">Presell</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onCreatePage('review' as PageType);
              onClose();
            }}
            className="w-full flex items-center justify-between px-6 py-3 bg-accent text-foreground rounded-md hover:bg-accent/80 transition-colors text-left"
          >
            <span className="text-body font-medium">Página de Review</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-body bg-primary text-primary-foreground hover:opacity-90 rounded-md transition-opacity"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
