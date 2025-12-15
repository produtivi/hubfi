'use client';

import { useState, useMemo } from 'react';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreatePageModal } from '../components/page-builder/create-page-modal';
import { PagesList } from '../components/page-builder/pages-table';
import { Page, PageType, PAGE_TYPES } from '../types/page-builder';

// Mock data - substituir com API real
const mockPages: Page[] = [
  {
    id: '1',
    name: 'teste',
    type: 'presell',
    domain: 'lojaonlineproducts.site',
    status: 'published',
    createdAt: new Date('2025-11-28T15:15:55'),
    updatedAt: new Date('2025-11-28T15:15:55')
  },
  {
    id: '2',
    name: 'google',
    type: 'presell',
    domain: 'theofficialportal.store',
    status: 'published',
    createdAt: new Date('2025-11-19T15:14:25'),
    updatedAt: new Date('2025-11-19T15:14:25')
  },
  {
    id: '3',
    name: 'teste-ricardo',
    type: 'presell',
    domain: 'onlydiscount.site',
    status: 'published',
    createdAt: new Date('2025-11-15T15:17:49'),
    updatedAt: new Date('2025-11-15T15:19:48')
  },
  {
    id: '4',
    name: 'tonicgreens',
    type: 'presell',
    domain: 'theofficialportal.store',
    status: 'published',
    createdAt: new Date('2025-11-14T17:54:25'),
    updatedAt: new Date('2025-11-14T20:23:44')
  },
  {
    id: '5',
    name: 'nervecalm',
    type: 'presell',
    domain: 'theofficialportal.store',
    status: 'published',
    createdAt: new Date('2025-11-11T18:30:52'),
    updatedAt: new Date('2025-11-13T11:17:11')
  },
  {
    id: '6',
    name: 'neuro-sharp',
    type: 'review',
    domain: 'theofficialportal.store',
    status: 'published',
    createdAt: new Date('2025-11-10T17:45:40'),
    updatedAt: new Date('2025-11-10T18:27:10')
  },
  {
    id: '7',
    name: 'lipovive',
    type: 'presell',
    domain: 'lojaonlineproducts.site',
    status: 'published',
    createdAt: new Date('2025-10-27T16:06:32'),
    updatedAt: new Date('2025-11-09T14:06:19')
  }
];

export default function PageBuilder() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<PageType | 'all'>('all');
  const [filterDomain, setFilterDomain] = useState<string | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Extrair domínios únicos das páginas
  const uniqueDomains = useMemo(() => {
    return Array.from(new Set(mockPages.map(page => page.domain)));
  }, []);

  // Filtrar páginas
  const filteredPages = useMemo(() => {
    return mockPages.filter(page => {
      const typeMatch = filterType === 'all' || page.type === filterType;
      const domainMatch = filterDomain === 'all' || page.domain === filterDomain;
      return typeMatch && domainMatch;
    });
  }, [filterType, filterDomain]);

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

  const handleEdit = (id: string) => {
    console.log('Editar página:', id);
    // Implementar navegação para editor
  };

  const handleView = (id: string) => {
    console.log('Visualizar página:', id);
    // Implementar visualização da página
  };

  const handleCopy = (id: string) => {
    console.log('Copiar página:', id);
    // Implementar duplicação de página
  };

  const handleDelete = (id: string) => {
    console.log('Excluir página:', id);
    // Implementar exclusão de página
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-headline mb-2">HubPage</h1>
            <p className="text-body-muted">
              Crie e personalize suas landing pages
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
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground text-foreground border border-border rounded-md hover:opacity-80 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-label font-medium">Atualizar</span>
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
      <PagesList
        pages={filteredPages}
        onEdit={handleEdit}
        onView={handleView}
        onCopy={handleCopy}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      <CreatePageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePage={handleCreatePage}
      />
    </div>
  );
}