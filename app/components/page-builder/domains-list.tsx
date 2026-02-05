'use client';

import { Eye, Trash01, Check, RefreshCw05 } from '@untitledui/icons';
import { Domain } from '@/types/page-builder';

interface DomainsListProps {
  domains: Domain[];
  onView: (domain: string) => void;
  onDelete: (id: string) => void;
  onVerifyDNS?: (domain: string) => void;
}

export function DomainsList({ domains, onView, onDelete, onVerifyDNS }: DomainsListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (domains.length === 0) {
    return (
      <div className="text-center py-12 text-body-muted">
        Nenhum domínio cadastrado
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {domains.map((domain) => (
        <div
          key={domain.id}
          className="bg-card border border-border rounded-md p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-body font-medium text-foreground">{domain.domain}</h3>
                {domain.status === 'published' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded">
                    <Check className="w-3 h-3 text-success" />
                    <span className="text-label text-success text-xs">Publicado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onVerifyDNS && domain.status !== 'published' && (
                <button
                  onClick={() => onVerifyDNS(domain.domain)}
                  className="p-2 hover:bg-blue-500/20 rounded-md transition-colors"
                  aria-label="Verificar DNS"
                  title="Verificar DNS"
                >
                  <RefreshCw05 className="w-4 h-4 text-foreground" />
                </button>
              )}
              <button
                onClick={() => onView(domain.domain)}
                className="p-2 hover:bg-green-500/20 rounded-md transition-colors"
                aria-label="Visualizar"
                title="Visualizar"
              >
                <Eye className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => onDelete(domain.id)}
                className="p-2 hover:bg-destructive/20 rounded-md transition-colors"
                aria-label="Excluir"
                title="Excluir"
              >
                <Trash01 className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-label mb-1">Criado em</p>
            <p className="text-body font-medium text-foreground">{formatDate(domain.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
