'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Eye, Trash2, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Domain } from '@/app/types/page-builder';
import { AddDomainModal } from '@/app/components/page-builder/add-domain-modal';
import { DomainsList } from '@/app/components/page-builder/domains-list';

// Mock data
const mockDomains: Domain[] = [
  {
    id: '1',
    domain: 'onlydiscount.site',
    status: 'published',
    createdAt: new Date('2025-10-30T19:34:36')
  },
  {
    id: '2',
    domain: 'lojaonlineproducts.site',
    status: 'published',
    createdAt: new Date('2025-05-06T21:21:31')
  },
  {
    id: '3',
    domain: 'theofficialportal.store',
    status: 'published',
    createdAt: new Date('2025-05-06T15:39:14')
  },
  {
    id: '4',
    domain: 'officialportal.tech',
    status: 'published',
    createdAt: new Date('2025-02-01T07:27:39')
  }
];

export default function DomainsPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [domains] = useState<Domain[]>(mockDomains);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleVerifyPublication = () => {
    console.log('Verificar publicação de domínios');
    // Implementar verificação de publicação
  };

  const handleView = (domain: string) => {
    console.log('Visualizar domínio:', domain);
    // Implementar visualização
  };

  const handleDelete = (id: string) => {
    console.log('Excluir domínio:', id);
    // Implementar exclusão
  };

  const handleAddDomain = (domain: string, registrar: 'godaddy' | 'hostinger' | 'already-have') => {
    console.log('Adicionar domínio:', domain, 'via', registrar);
    // Implementar adição de domínio
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-accent rounded-md transition-colors mt-1"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-headline mb-2">Meus Domínios</h1>
              <p className="text-body-muted">
                Gerencie seus domínios e nameservers
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-label font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar domínio
          </button>

          <button
            onClick={handleVerifyPublication}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:opacity-80 transition-opacity text-label"
          >
            <AlertCircle className="w-4 h-4" />
            Verificar publicação
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-label text-muted-foreground">
          <span className="text-foreground font-medium">{domains.length}</span> domínios cadastrados
        </p>
      </div>

      {/* Domains List */}
      <DomainsList
        domains={domains}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDomain={handleAddDomain}
      />
    </div>
  );
}
