'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreatePageModal } from '../components/page-builder/create-page-modal';
import { DeleteConfirmationModal } from '../components/page-builder/delete-confirmation-modal';
import { PagesList } from '../components/page-builder/pages-table';
import { Page, PageType, PAGE_TYPES } from '../types/page-builder';
import { Toast } from '../components/ui/toast';
import { useToast } from '../hooks/useToast';

interface Presell {
  id: number;
  pageName: string;
  presellType: string;
  language: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  affiliateLink: string;
  screenshotDesktop?: string;
  screenshotMobile?: string;
  domain: {
    domainName: string;
  };
  fullUrl: string;
}

export default function PageBuilder() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<PageType | 'all'>('all');
  const [filterDomain, setFilterDomain] = useState<string | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [presells, setPresells] = useState<Presell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    pageId: string;
    pageName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    pageId: '',
    pageName: '',
    isDeleting: false
  });

  // Carregar presells da API
  useEffect(() => {
    loadPresells();
  }, []);

  const loadPresells = async () => {
    try {
      setIsLoading(true);
      // Tentar pegar userId do usuário logado
      let queryParam = '';
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          queryParam = `?userId=${userData.user.id}`;
        }
      } catch {
        // Se não estiver logado, buscar todos (em dev)
      }
      
      const response = await fetch(`/api/presells${queryParam}`);
      const result = await response.json();
      
      if (result.success) {
        setPresells(result.data);
      } else {
        console.error('Erro ao carregar presells:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar presells:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Converter presells para o formato de páginas
  const pages: Page[] = useMemo(() => {
    return presells.map(presell => ({
      id: presell.id.toString(),
      name: presell.pageName,
      type: 'presell' as PageType,
      domain: presell.domain.domainName,
      status: presell.status as 'draft' | 'published' | 'archived',
      createdAt: new Date(presell.createdAt),
      updatedAt: new Date(presell.updatedAt),
      url: presell.fullUrl
    }));
  }, [presells]);

  // Extrair domínios únicos das páginas
  const uniqueDomains = useMemo(() => {
    return Array.from(new Set(pages.map(page => page.domain)));
  }, [pages]);

  // Filtrar páginas
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const typeMatch = filterType === 'all' || page.type === filterType;
      const domainMatch = filterDomain === 'all' || page.domain === filterDomain;
      return typeMatch && domainMatch;
    });
  }, [pages, filterType, filterDomain]);

  const handleCreatePage = (type: PageType) => {
    if (type === 'presell') {
      router.push('/page-builder/create-presell');
    } else if (type === 'review') {
      router.push('/page-builder/create-review');
    } else {
      console.log('Criar página do tipo:', type);
      // Implementar lógica para outros tipos de página
    }
  };

  // Função para recarregar manualmente se necessário
  // (removido auto-reload no focus para evitar conflito com preview)

  const handleEdit = (id: string) => {
    router.push(`/page-builder/edit-presell/${id}`);
  };

  const handleView = (id: string) => {
    // Abrir preview em nova guia
    window.open(`/preview/${id}`, '_blank');
  };

  const handleCopy = async (id: string) => {
    try {
      const previewUrl = `${window.location.origin}/preview/${id}`;
      await navigator.clipboard.writeText(previewUrl);
      showSuccess('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      showError('Erro ao copiar o link');
    }
  };

  const handleDelete = (id: string) => {
    const presell = presells.find(p => p.id.toString() === id);
    if (presell) {
      setDeleteModal({
        isOpen: true,
        pageId: id,
        pageName: presell.pageName,
        isDeleting: false
      });
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/presells/${deleteModal.pageId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Recarregar a lista de presells após exclusão
        await loadPresells();
        setDeleteModal({
          isOpen: false,
          pageId: '',
          pageName: '',
          isDeleting: false
        });
      } else {
        alert('Erro ao excluir página: ' + result.error);
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      alert('Erro ao excluir página');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCancelDelete = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        pageId: '',
        pageName: '',
        isDeleting: false
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-headline mb-2">HubPage</h1>
            <p className="text-body-muted">
              Crie e personalize suas pages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/page-builder/domains')}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:opacity-80 transition-opacity"
            >
              <Settings className="w-4 h-4" />
              <span className="text-label font-medium">Gerenciar Domínios</span>
            </button>
            <button
              onClick={loadPresells}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground text-foreground border border-border rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-label font-medium">{isLoading ? 'Carregando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-label font-medium"
        >
          <Plus className="w-5 h-5" />
          Criar Página
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-label mb-2">Tipo de página</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PageType | 'all')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(PAGE_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label mb-2">Domínio</label>
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
            >
              <option value="all">Todos os domínios</option>
              {uniqueDomains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="mt-4 text-label text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            setFilterType('all');
            setFilterDomain('all');
          }}
        >
          Limpar Filtros
        </button>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-label text-muted-foreground">
          <span className="text-foreground font-medium">{filteredPages.length}</span> páginas encontradas
        </p>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-body">Carregando páginas...</span>
          </div>
        </div>
      ) : (
        <PagesList
          pages={filteredPages}
          onEdit={handleEdit}
          onView={handleView}
          onCopy={handleCopy}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <CreatePageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePage={handleCreatePage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        pageName={deleteModal.pageName}
        isDeleting={deleteModal.isDeleting}
      />

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}