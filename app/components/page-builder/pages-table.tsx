'use client';

import { Eye, Edit02, Copy01, Trash01, Check } from '@untitledui/icons';
import { Page, PAGE_TYPES } from '@/types/page-builder';
import { ScreenshotStatus } from './screenshot-status';
import { useState } from 'react';

interface PagesListProps {
  pages: Page[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onPreviewComplete?: () => void;
}

export function PagesList({ pages, onEdit, onView, onCopy, onDelete, onPreviewComplete }: PagesListProps) {
  const [completedPreviews, setCompletedPreviews] = useState<Set<string>>(new Set());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePreviewComplete = (pageId: string) => {
    setCompletedPreviews(prev => new Set(prev).add(pageId));
    onPreviewComplete?.();
  };

  const needsPreview = (page: Page) => {
    return !page.screenshotDesktop && !completedPreviews.has(page.id);
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-12 text-body-muted">
        Nenhuma página encontrada
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {pages.map((page) => (
        <div
          key={page.id}
          className="bg-card border border-border rounded-md p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-body font-medium text-foreground">{page.name}</h3>
                {page.status === 'published' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded">
                    <Check className="w-3 h-3 text-success" />
                    <span className="text-label text-success text-xs">Publicado</span>
                  </div>
                )}
              </div>
              <p className="text-label text-muted-foreground">{PAGE_TYPES[page.type].label}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(page.id)}
                className="p-2 hover:bg-blue-500/20 rounded-md transition-colors"
                aria-label="Editar"
                title="Editar"
              >
                <Edit02 className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => onView(page.id)}
                className="p-2 hover:bg-green-500/20 rounded-md transition-colors"
                aria-label="Visualizar"
                title="Visualizar"
              >
                <Eye className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => onCopy(page.id)}
                className="p-2 hover:bg-amber-500/20 rounded-md transition-colors"
                aria-label="Copiar"
                title="Copiar"
              >
                <Copy01 className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => onDelete(page.id)}
                className="p-2 hover:bg-destructive/20 rounded-md transition-colors"
                aria-label="Excluir"
                title="Excluir"
              >
                <Trash01 className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-label mb-1">Domínio</p>
              <p className="text-body font-medium text-foreground">{page.domain}</p>
            </div>
            <div>
              <p className="text-label mb-1">Criado em</p>
              <p className="text-body font-medium text-foreground">{formatDate(page.createdAt)}</p>
            </div>
            <div>
              <p className="text-label mb-1">Atualizado em</p>
              <p className="text-body font-medium text-foreground">{formatDate(page.updatedAt)}</p>
            </div>
          </div>

          {/* Status de prévia se estiver processando */}
          {needsPreview(page) && (
            <div className="mt-4 pt-4 border-t border-border">
              <ScreenshotStatus
                presellId={parseInt(page.id)}
                onComplete={() => handlePreviewComplete(page.id)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
