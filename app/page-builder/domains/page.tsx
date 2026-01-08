'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, Trash2, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Domain } from '@/app/types/page-builder';
import { AddDomainModal } from '@/app/components/page-builder/add-domain-modal';
import { DomainsList } from '@/app/components/page-builder/domains-list';

export default function DomainsPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar domínios do banco
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/domains');
      const result = await response.json();
      
      if (result.success) {
        // Mapear dados do banco para o formato esperado pelo componente
        const mappedDomains: Domain[] = result.data.map((domain: any) => ({
          id: domain.id.toString(),
          domain: domain.domainName,
          status: domain.isActive ? 'published' : 'draft',
          createdAt: new Date(domain.createdAt)
        }));
        
        setDomains(mappedDomains);
      } else {
        console.error('Erro ao carregar domínios:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddDomain = async (domain: string, registrar: 'godaddy' | 'hostinger' | 'already-have') => {
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainName: domain,
          registrar: registrar === 'already-have' ? 'other' : registrar
        })
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar lista de domínios
        await loadDomains();
        setIsAddModalOpen(false);
        console.log('Domínio adicionado com sucesso!');
      } else {
        console.error('Erro ao adicionar domínio:', result.error);
      }
    } catch (error) {
      console.error('Erro ao adicionar domínio:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Carregando domínios...</span>
        </div>
      </div>
    );
  }

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
