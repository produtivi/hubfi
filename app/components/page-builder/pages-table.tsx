'use client';

import { Eye, Edit02, Copy01, Trash01, Check } from '@untitledui/icons';
import { Page, PAGE_TYPES } from '@/types/page-builder';

interface PagesListProps {
  pages: Page[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PagesList({ pages, onEdit, onView, onCopy, onDelete }: PagesListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
          className="bg-card border border-border rounded-md p-4 md:p-6 hover:shadow-sm transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-body font-medium text-foreground truncate">{page.name}</h3>
                {page.status === 'published' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded shrink-0">
                    <Check className="w-3 h-3 text-success" />
                    <span className="text-label text-success text-xs">Publicado</span>
                  </div>
                )}
              </div>
              <p className="text-label text-muted-foreground">{PAGE_TYPES[page.type].label}</p>
            </div>

            {/* Mobile: Domínio no header */}
            <div className="shrink-0 ml-2 text-right md:hidden">
              <p className="text-label text-muted-foreground mb-0.5">Domínio</p>
              <p className="text-body font-medium text-foreground truncate max-w-[180px]">{page.domain}</p>
            </div>

            {/* Desktop: Ícones de ação no header */}
            <div className="hidden md:flex items-center gap-1 shrink-0 ml-2">
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

          {/* Desktop: Domínio + Datas em 3 colunas */}
          <div className="hidden md:grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-label mb-1">Domínio</p>
              <p className="text-body font-medium text-foreground truncate">{page.domain}</p>
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

          {/* Mobile: Datas */}
          <div className="flex gap-4 justify-between pt-4 border-t border-border md:hidden">
            <div>
              <p className="text-label text-muted-foreground mb-0.5">Criado em</p>
              <p className="text-body font-medium text-foreground">{formatDate(page.createdAt)}</p>
            </div>
            <div>
              <p className="text-label text-muted-foreground mb-0.5">Atualizado em</p>
              <p className="text-body font-medium text-foreground">{formatDate(page.updatedAt)}</p>
            </div>
          </div>

          {/* Mobile: Ações em botões */}
          <div className="flex items-center justify-between gap-2 pt-4 md:hidden">
            <button
              onClick={() => onEdit(page.id)}
              className="p-1 border border-border hover:bg-accent gap-1 flex flex-row rounded-md transition-colors"
              aria-label="Editar"
              title="Editar"
            >
              <Edit02 className="w-3 h-4 text-foreground mt-1" />
              Editar
            </button>
            <button
              onClick={() => onView(page.id)}
              className="p-1 border border-border hover:bg-accent flex flex-row gap-1 rounded-md transition-colors"
              aria-label="Visualizar"
              title="Visualizar"
            >
              <Eye className="w-4 h-4 text-foreground mt-1" />
              Visualizar
            </button>
            <button
              onClick={() => onCopy(page.id)}
              className="p-1 border border-border hover:bg-accent gap-1 flex flex-row rounded-md transition-colors"
              aria-label="Copiar"
              title="Copiar"
            >
              <Copy01 className="w-4 h-4 text-foreground mt-1" />
              Copiar
            </button>
            <button
              onClick={() => onDelete(page.id)}
              className="p-1 border border-border hover:bg-destructive/20 rounded-md gap-1 flex flex-row transition-colors"
              aria-label="Excluir"
              title="Excluir"
            >
              <Trash01 className="w-4 h-4 text-foreground mt-0.5" />
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
