'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, AlertCircle } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { Domain } from '@/types/page-builder';
import { AddDomainModal } from '@/components/page-builder/add-domain-modal';
import { DeleteDomainModal } from '@/components/page-builder/delete-domain-modal';
import { DomainsList } from '@/components/page-builder/domains-list';
import { Button } from '@/components/base/buttons/button';
import { useHubPageToast } from '../toast-context';
import { useUser } from '@/hooks/use-user';

export default function DomainsPage() {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useHubPageToast();
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar domínios do banco quando o usuário estiver disponível
  useEffect(() => {
    if (user?.id) {
      loadDomains();
    }
  }, [user?.id]);

  const loadDomains = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/custom-domains?userId=${user.id}`);
      const result = await response.json();

      if (result.domains) {
        // Mapear dados do Cloudflare para o formato esperado pelo componente
        const mappedDomains: Domain[] = result.domains.map((domain: any) => ({
          id: domain.id,
          domain: domain.hostname,
          status: domain.status === 'active' ? 'published' : 'draft',
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

  const handleVerifyPublication = async () => {
    // Recarregar todos os domínios
    await loadDomains();
  };

  const handleVerifyDNS = async (domain: string) => {
    try {
      const response = await fetch('/api/custom-domains/validate-dns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostname: domain })
      });

      const result = await response.json();

      if (result.configured) {
        showSuccess(`DNS configurado corretamente para ${domain}!`);
        // Recarregar domínios para atualizar o status
        await loadDomains();
      } else {
        showInfo(result.message || 'DNS ainda não configurado ou não propagado');
      }
    } catch (error) {
      console.error('Erro ao verificar DNS:', error);
      showError('Erro ao verificar DNS');
    }
  };

  const handleView = (domain: string) => {
    // TODO: Implementar visualização
    window.open(`https://${domain}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    // Encontrar o domínio para pegar o nome
    const domain = domains.find(d => d.id === id);
    if (!domain) return;

    setDomainToDelete({ id, name: domain.domain });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!domainToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/custom-domains/${domainToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showSuccess('Domínio removido com sucesso!');
        setIsDeleteModalOpen(false);
        setDomainToDelete(null);
        loadDomains();
      } else {
        showError('Erro ao remover domínio');
      }
    } catch (error) {
      console.error('Erro ao deletar domínio:', error);
      showError('Erro ao remover domínio');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddDomain = async (domain: string, registrar: 'godaddy' | 'hostinger' | 'already-have') => {
    if (!user?.id) {
      showError('Usuário não autenticado');
      return;
    }

    try {
      const response = await fetch('/api/custom-domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostname: domain.toLowerCase().trim(),
          userId: user.id
        })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(`Domínio ${domain} adicionado com sucesso!`);
        // Recarregar lista de domínios
        await loadDomains();
        setIsAddModalOpen(false);
      } else {
        console.error('Erro ao adicionar domínio:', result.error);
        showError(result.error || 'Erro ao adicionar domínio');
      }
    } catch (error) {
      console.error('Erro ao adicionar domínio:', error);
      showError('Erro ao adicionar domínio');
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
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
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
        <div className="flex items-center gap-2 md:gap-4">
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

      {/* Info Banner */}
      {domains.length > 0 && (
        <div className="mb-6 p-3 bg-accent border border-border rounded-md">
          <p className="text-label text-muted-foreground">
            Após configurar o DNS, pode levar de 5 minutos até 24 horas para o domínio começar a funcionar.
          </p>
        </div>
      )}

      {/* Domains List */}
      <DomainsList
        domains={domains}
        onView={handleView}
        onDelete={handleDelete}
        onVerifyDNS={handleVerifyDNS}
      />

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDomain={handleAddDomain}
      />

      {/* Delete Domain Modal */}
      <DeleteDomainModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDomainToDelete(null);
        }}
        onConfirm={confirmDelete}
        domainName={domainToDelete?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
