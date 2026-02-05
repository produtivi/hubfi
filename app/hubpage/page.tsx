'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, RefreshCw05, Settings01, SearchLg, FilterLines } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { CreatePageModal } from '../components/page-builder/create-page-modal';
import { DeleteConfirmationModal } from '../components/page-builder/delete-confirmation-modal';
import { PagesList } from '../components/page-builder/pages-table';
import { Page, PageType, PAGE_TYPES } from '../types/page-builder';
import { useHubPageToast } from './toast-context';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { Input } from '@/components/base/input/input';
import type { Key } from 'react-aria-components';

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
  htmlUrl?: string;
  domain: {
    domainName: string;
  };
  fullUrl: string;
}

export default function PageBuilder() {
  const router = useRouter();
  const { showSuccess, showError } = useHubPageToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
      url: presell.fullUrl,
      screenshotDesktop: presell.screenshotDesktop,
      screenshotMobile: presell.screenshotMobile
    }));
  }, [presells]);

  // Extrair domínios únicos das páginas
  const uniqueDomains = useMemo(() => {
    return Array.from(new Set(pages.map(page => page.domain)));
  }, [pages]);

  // Filtrar páginas
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const searchMatch = searchQuery === '' ||
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.domain.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = filterType === 'all' || page.type === filterType;
      const domainMatch = filterDomain === 'all' || page.domain === filterDomain;
      return searchMatch && typeMatch && domainMatch;
    });
  }, [pages, searchQuery, filterType, filterDomain]);

  const handleCreatePage = (type: PageType) => {
    if (type === 'presell') {
      router.push('/hubpage/create-presell');
    } else if (type === 'review') {
      router.push('/hubpage/create-review');
    }
  };

  // Função para recarregar manualmente se necessário
  // (removido auto-reload no focus para evitar conflito com preview)

  const handleEdit = (id: string) => {
    router.push(`/hubpage/edit-presell/${id}`);
  };

  const handleView = (id: string) => {
    // Buscar a presell
    const presell = presells.find(p => p.id.toString() === id);

    if (presell?.fullUrl) {
      // Abrir a página no domínio customizado
      window.open(presell.fullUrl, '_blank');
    } else {
      // Fallback para o preview Next.js enquanto não está publicado
      window.open(`/preview/${id}`, '_blank');
    }
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
        showSuccess(`Página "${deleteModal.pageName}" excluída com sucesso!`);
        // Recarregar a lista de presells após exclusão
        await loadPresells();
        setDeleteModal({
          isOpen: false,
          pageId: '',
          pageName: '',
          isDeleting: false
        });
      } else {
        showError(`Erro ao excluir página: ${result.error}`);
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      showError('Erro ao excluir página');
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
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-start justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-headline mb-1 md:mb-2">HubPage</h1>
            <p className="text-body-muted">
              Crie e personalize suas pages
            </p>
          </div>
          <Button
            color="secondary"
            size="sm"
            iconLeading={Settings01}
            onClick={() => router.push('/hubpage/domains')}
            className="hidden md:flex"
          >
            Gerenciar Domínios
          </Button>
          <Button
            color="secondary"
            size="sm"
            iconLeading={Settings01}
            onClick={() => router.push('/hubpage/domains')}
            className="flex md:hidden"
          >
            Domínios
          </Button>
        </div>

        {/* Search + Filters + Create Button */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar páginas por nome ou domínio..."
              value={searchQuery}
              onChange={(value: string) => setSearchQuery(value)}
              icon={SearchLg}
            />
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button
              color={showFilters ? 'primary' : 'secondary'}
              size="md"
              iconLeading={FilterLines}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 md:flex-none"
            >
              Filtros
            </Button>
            <Button
              color="primary"
              size="md"
              iconLeading={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 md:flex-none"
            >
              Criar Página
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-label">Tipo de página</label>
              <Select
                placeholder="Todos os tipos"
                selectedKey={filterType}
                onSelectionChange={(key: Key | null) => setFilterType((key as PageType | 'all') || 'all')}
                items={[
                  { id: 'all', label: 'Todos os tipos' },
                  ...Object.entries(PAGE_TYPES).map(([key, value]) => ({ id: key, label: value.label }))
                ]}
              >
                {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="block text-label">Domínio</label>
              <Select
                placeholder="Todos os domínios"
                selectedKey={filterDomain}
                onSelectionChange={(key: Key | null) => setFilterDomain((key as string) || 'all')}
                items={[
                  { id: 'all', label: 'Todos os domínios' },
                  ...uniqueDomains.map((domain) => ({ id: domain, label: domain }))
                ]}
              >
                {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
              </Select>
            </div>
          </div>

          <Button
            color="link-gray"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterDomain('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      )}

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
            <RefreshCw05 className="w-5 h-5 animate-spin" />
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
          onPreviewComplete={loadPresells}
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
    </div>
  );
}