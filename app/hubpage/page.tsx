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

interface Review {
  id: number;
  pageName: string;
  productName: string;
  productType: string;
  niche: string;
  language: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  affiliateLink: string;
  contentHtml?: string;
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
  const [reviews, setReviews] = useState<Review[]>([]);
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

  // Carregar presells e reviews da API
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
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

      // Carregar presells e reviews em paralelo
      const [presellsResponse, reviewsResponse] = await Promise.all([
        fetch(`/api/presells${queryParam}`),
        fetch(`/api/reviews${queryParam}`)
      ]);

      const [presellsResult, reviewsResult] = await Promise.all([
        presellsResponse.json(),
        reviewsResponse.json()
      ]);

      if (presellsResult.success) {
        setPresells(presellsResult.data);
      } else {
        console.error('Erro ao carregar presells:', presellsResult.error);
      }

      if (reviewsResult.success) {
        setReviews(reviewsResult.data);
      } else {
        console.error('Erro ao carregar reviews:', reviewsResult.error);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função legada para compatibilidade
  const loadPresells = loadPages;

  // Converter presells e reviews para o formato de páginas
  const pages: Page[] = useMemo(() => {
    const presellPages = presells.map(presell => ({
      id: `presell-${presell.id}`,
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

    const reviewPages = reviews.map(review => ({
      id: `review-${review.id}`,
      name: review.pageName,
      type: 'review' as PageType,
      domain: review.domain.domainName,
      status: review.status as 'draft' | 'published' | 'archived',
      createdAt: new Date(review.createdAt),
      updatedAt: new Date(review.updatedAt),
      url: review.fullUrl,
      screenshotDesktop: undefined,
      screenshotMobile: undefined
    }));

    // Combinar e ordenar por data de criação (mais recente primeiro)
    return [...presellPages, ...reviewPages].sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [presells, reviews]);

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
    const [type, realId] = id.split('-');
    if (type === 'presell') {
      router.push(`/hubpage/edit-presell/${realId}`);
    } else if (type === 'review') {
      router.push(`/hubpage/edit-review/${realId}`);
    }
  };

  const handleView = (id: string) => {
    const [type, realId] = id.split('-');

    if (type === 'presell') {
      const presell = presells.find(p => p.id.toString() === realId);
      if (presell?.fullUrl) {
        window.open(presell.fullUrl, '_blank');
      } else {
        window.open(`/preview/${realId}`, '_blank');
      }
    } else if (type === 'review') {
      const review = reviews.find(r => r.id.toString() === realId);
      if (review?.fullUrl) {
        window.open(review.fullUrl, '_blank');
      }
    }
  };

  const handleCopy = async (id: string) => {
    const [type, realId] = id.split('-');
    const page = pages.find(p => p.id === id);

    try {
      if (page?.url) {
        await navigator.clipboard.writeText(page.url);
      } else {
        const previewUrl = `${window.location.origin}/preview/${realId}`;
        await navigator.clipboard.writeText(previewUrl);
      }
      showSuccess('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      showError('Erro ao copiar o link');
    }
  };

  const handleDelete = (id: string) => {
    const [type, realId] = id.split('-');

    if (type === 'presell') {
      const presell = presells.find(p => p.id.toString() === realId);
      if (presell) {
        setDeleteModal({
          isOpen: true,
          pageId: id,
          pageName: presell.pageName,
          isDeleting: false
        });
      }
    } else if (type === 'review') {
      const review = reviews.find(r => r.id.toString() === realId);
      if (review) {
        setDeleteModal({
          isOpen: true,
          pageId: id,
          pageName: review.pageName,
          isDeleting: false
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    const [type, realId] = deleteModal.pageId.split('-');
    const apiEndpoint = type === 'presell' ? `/api/presells/${realId}` : `/api/reviews/${realId}`;

    try {
      const response = await fetch(apiEndpoint, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(`Página "${deleteModal.pageName}" excluída com sucesso!`);
        // Recarregar a lista de páginas após exclusão
        await loadPages();
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
          onPreviewComplete={loadPages}
          onCreateFirst={() => setIsCreateModalOpen(true)}
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