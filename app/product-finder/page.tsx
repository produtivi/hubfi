'use client';

import { useState, useMemo } from 'react';
import { PlatformSelector } from '../components/platform-selector';
import { ProductFiltersSidebar } from '../components/product-filters-sidebar';
import { ProductCardNew } from '../components/product-card-new';
import type { Product, ProductFilters, Platform } from '../types/product';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'LÍNGUA PORTUGUESA - Planejamentos do 6º ao 9º ano - BNCC 2022',
    creator: 'ALFABETINHO',
    score: 3,
    reviewCount: 31,
    temperature: 23,
    commissionPercent: 59.57,
    commissionValue: 30,
    price: 57,
    platform: 'hotmart',
    niche: 'educacao',
    salesPageUrl: 'https://example.com',
    language: 'pt',
    currency: 'BRL',
    hasRecurrence: false,
    isAvailableForAffiliation: false,
    hotleads: false,
    addedDate: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: '15 Frases que deixam os Homens Loucos Por Você!',
    creator: 'ESCOLHAUP',
    score: 3,
    reviewCount: 9,
    temperature: 22,
    commissionPercent: 30,
    commissionValue: 18,
    price: 67,
    platform: 'hotmart',
    niche: 'relacionamento',
    salesPageUrl: 'https://example.com',
    language: 'pt',
    currency: 'BRL',
    hasRecurrence: false,
    isAvailableForAffiliation: false,
    hotleads: false,
    addedDate: new Date('2024-02-10'),
  },
  {
    id: '3',
    name: 'Curso de Fibra',
    creator: 'Raiza',
    score: 0,
    reviewCount: 0,
    temperature: 24,
    commissionPercent: 62.4,
    commissionValue: 4,
    price: 10,
    platform: 'hotmart',
    niche: 'moda-beleza',
    salesPageUrl: 'https://example.com',
    language: 'pt',
    currency: 'BRL',
    hasRecurrence: false,
    isAvailableForAffiliation: true,
    hotleads: false,
    addedDate: new Date('2024-03-01'),
  },
];

export default function ProductFinderPageNew() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['hotmart']);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('recent');

  const filteredProducts = useMemo(() => {
    const result = mockProducts.filter((product) => {
      if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(product.platform)) return false;
      if (filters.niche && product.niche !== filters.niche) return false;
      if (filters.language && product.language !== filters.language) return false;
      if (filters.currency && product.currency !== filters.currency) return false;
      if (filters.temperatureMin && product.temperature < filters.temperatureMin) return false;
      if (filters.temperatureMax && product.temperature > filters.temperatureMax) return false;
      if (filters.priceMin && product.price < filters.priceMin) return false;
      if (filters.priceMax && product.price > filters.priceMax) return false;
      if (filters.commissionValueMin && product.commissionValue < filters.commissionValueMin) return false;
      if (filters.commissionValueMax && product.commissionValue > filters.commissionValueMax) return false;
      if (filters.commissionPercentMin && product.commissionPercent < filters.commissionPercentMin) return false;
      if (filters.commissionPercentMax && product.commissionPercent > filters.commissionPercentMax) return false;
      if (filters.minReviews && product.reviewCount < filters.minReviews) return false;
      if (filters.minScore && product.score < filters.minScore) return false;
      if (filters.hotleads && !product.hotleads) return false;
      if (filters.hasRecurrence !== undefined && product.hasRecurrence !== filters.hasRecurrence) return false;
      if (filters.onlyAvailable && !product.isAvailableForAffiliation) return false;
      if (filters.searchContains && !product.name.toLowerCase().includes(filters.searchContains.toLowerCase())) return false;
      if (filters.searchNotContains && product.name.toLowerCase().includes(filters.searchNotContains.toLowerCase())) return false;
      return true;
    });

    return result;
  }, [filters, selectedPlatforms]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.niche) count++;
    if (filters.language) count++;
    if (filters.currency) count++;
    if (filters.temperatureMin) count++;
    if (filters.temperatureMax) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.commissionValueMin) count++;
    if (filters.commissionValueMax) count++;
    if (filters.commissionPercentMin) count++;
    if (filters.commissionPercentMax) count++;
    if (filters.minReviews) count++;
    if (filters.minScore) count++;
    if (filters.blueprintRateMin) count++;
    if (filters.affiliationType) count++;
    if (filters.hotleads) count++;
    if (filters.hasRecurrence !== undefined) count++;
    if (filters.onlyAvailable) count++;
    if (filters.onlyWorkingSalesPage) count++;
    if (filters.searchContains) count++;
    if (filters.searchNotContains) count++;
    return count;
  }, [filters]);

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-headline mb-4">HubFinder</h1>

        {/* Platform Selector */}
        <PlatformSelector
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={setSelectedPlatforms}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar */}
        <aside>
          <ProductFiltersSidebar
            filters={filters}
            onFiltersChange={setFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </aside>

        {/* Products Grid */}
        <main>
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="text-primary hover:text-primary/80 text-label font-medium transition-colors">
                Comece por aqui
              </button>
              <button className="flex items-center gap-2 border border-border bg-card rounded-md px-4 py-2 text-label hover:bg-accent transition-colors">
                Meus Omitidos
              </button>
              <button className="flex items-center gap-2 border border-border bg-card rounded-md px-4 py-2 text-label hover:bg-accent transition-colors">
                Meus Favoritos
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border bg-card text-foreground rounded-md px-4 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Atualizados recentemente</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="temperature">Temperatura</option>
            </select>
          </div>

          {/* Results Info */}
          <div className="bg-card rounded-md border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-body font-medium text-foreground">
                {filteredProducts.length.toLocaleString()} produtos encontrados
              </p>
              <div className="flex items-center gap-2">
                <button className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-md text-label transition-colors">
                  Anterior
                </button>
                <span className="px-4 py-2 text-label text-muted-foreground">
                  Página 1 de {Math.ceil(filteredProducts.length / 50)}
                </span>
                <button className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md text-label transition-colors">
                  Próxima
                </button>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => setFilters({})}
                className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md text-label font-medium transition-colors"
              >
                Limpar {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductCardNew
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="bg-card rounded-md border border-border p-12 text-center">
              <p className="text-body text-muted-foreground mb-4">
                Nenhum produto encontrado com os filtros selecionados.
              </p>
              <button
                onClick={() => setFilters({})}
                className="text-primary hover:text-primary/80 font-medium text-label transition-colors"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
