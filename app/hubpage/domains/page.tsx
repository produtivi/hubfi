'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, AlertCircle } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { Domain } from '@/types/hubpage';
import { AddDomainModal } from '@/components/hubpage/add-domain-modal';
import { DomainsList } from '@/components/hubpage/domains-list';
import { Button } from '@/components/base/buttons/button';

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
    // TODO: Implementar verificação de publicação
    console.log('Verificar publicação');
  };

  const handleView = (domain: string) => {
    // TODO: Implementar visualização
    window.open(`https://${domain}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este domínio?')) return;

    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadDomains();
      }
    } catch (error) {
      console.error('Erro ao deletar domínio:', error);
    }
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
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Adicionar domínio
          </Button>

          <Button
            color="secondary"
            size="sm"
            iconLeading={AlertCircle}
            onClick={handleVerifyPublication}
          >
            Verificar publicação
          </Button>
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
