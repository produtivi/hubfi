import { HelpCircle } from 'lucide-react';
import type { ProductFilters } from '../types/product';

interface ProductFiltersSidebarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  activeFiltersCount: number;
}

export function ProductFiltersSidebar({ filters, onFiltersChange, activeFiltersCount }: ProductFiltersSidebarProps) {
  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-card rounded-md border border-border p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-body font-medium text-foreground">
          Filtros da <span className="text-primary">Hotmart</span>
        </h2>
        <HelpCircle className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="text-label text-muted-foreground mb-3">
        {activeFiltersCount} filtro(s) aplicado(s)
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-primary hover:text-primary/80 text-label font-medium mb-4 transition-colors"
        >
          Limpar filtros
        </button>
      )}

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <div>
          <label className="block text-label font-medium text-foreground mb-2">Idioma</label>
          <select
            value={filters.language || ''}
            onChange={(e) => onFiltersChange({ ...filters, language: e.target.value as any })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="pt">Português</option>
            <option value="en">Inglês</option>
            <option value="es">Espanhol</option>
          </select>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">Moeda</label>
          <select
            value={filters.currency || ''}
            onChange={(e) => onFiltersChange({ ...filters, currency: e.target.value as any })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="BRL">Real (R$)</option>
            <option value="USD">Dólar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-label font-medium text-foreground">Temperatura</label>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Mínima</label>
              <input
                type="number"
                min="0"
                max="150"
                value={filters.temperatureMin || ''}
                onChange={(e) => onFiltersChange({ ...filters, temperatureMin: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Máxima (150)</label>
              <input
                type="number"
                min="0"
                max="150"
                value={filters.temperatureMax || ''}
                onChange={(e) => onFiltersChange({ ...filters, temperatureMax: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="150"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-label font-medium text-foreground">Preço do produto</label>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Mínima(R$)</label>
              <input
                type="number"
                min="0"
                value={filters.priceMin || ''}
                onChange={(e) => onFiltersChange({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Máxima(R$)</label>
              <input
                type="number"
                min="0"
                value={filters.priceMax || ''}
                onChange={(e) => onFiltersChange({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-label font-medium text-foreground">Comissão</label>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Mínima(R$)</label>
              <input
                type="number"
                min="0"
                value={filters.commissionValueMin || ''}
                onChange={(e) => onFiltersChange({ ...filters, commissionValueMin: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Máxima(R$)</label>
              <input
                type="number"
                min="0"
                value={filters.commissionValueMax || ''}
                onChange={(e) => onFiltersChange({ ...filters, commissionValueMax: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-label font-medium text-foreground">Comissão (%)</label>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Mínima(%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.commissionPercentMin || ''}
                onChange={(e) => onFiltersChange({ ...filters, commissionPercentMin: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label text-muted-foreground mb-1 block">Máxima (100)(%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.commissionPercentMax || ''}
                onChange={(e) => onFiltersChange({ ...filters, commissionPercentMax: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-label font-medium text-foreground">Avaliações</label>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <select
            value={filters.minScore || ''}
            onChange={(e) => onFiltersChange({ ...filters, minScore: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="1">⭐ 1+</option>
            <option value="2">⭐⭐ 2+</option>
            <option value="3">⭐⭐⭐ 3+</option>
            <option value="4">⭐⭐⭐⭐ 4+</option>
            <option value="5">⭐⭐⭐⭐⭐ 5</option>
          </select>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">
            Quantidade mínima de avaliações
          </label>
          <input
            type="number"
            min="0"
            value={filters.minReviews || ''}
            onChange={(e) => onFiltersChange({ ...filters, minReviews: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-label font-medium text-foreground">Taxa mínima de blueprint(%)</label>
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.blueprintRateMin || ''}
            onChange={(e) => onFiltersChange({ ...filters, blueprintRateMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">Nicho</label>
          <select
            value={filters.niche || ''}
            onChange={(e) => onFiltersChange({ ...filters, niche: e.target.value as any })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="saude">Saúde</option>
            <option value="relacionamento">Relacionamento</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="espiritualidade">Espiritualidade</option>
            <option value="educacao">Educação</option>
            <option value="moda-beleza">Moda e Beleza</option>
            <option value="musica-artes">Música & Artes</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">Busca por texto</label>

          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <label className="text-label text-muted-foreground">Contenham</label>
              <HelpCircle className="w-3 h-3 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={filters.searchContains || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchContains: e.target.value || undefined })}
              className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-label text-muted-foreground">Não contém</label>
              <HelpCircle className="w-3 h-3 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={filters.searchNotContains || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchNotContains: e.target.value || undefined })}
              className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">Tipo de afiliação</label>
          <select
            value={filters.affiliationType || ''}
            onChange={(e) => onFiltersChange({ ...filters, affiliationType: e.target.value as any })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="cpa">CPA</option>
            <option value="cpl">CPL</option>
            <option value="revshare">RevShare</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hotleads"
            checked={filters.hotleads || false}
            onChange={(e) => onFiltersChange({ ...filters, hotleads: e.target.checked || undefined })}
            className="rounded border-border"
          />
          <label htmlFor="hotleads" className="text-label text-foreground">Hotleads?</label>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">
            Produtos com recorrência?
          </label>
          <select
            value={filters.hasRecurrence === undefined ? '' : filters.hasRecurrence ? 'yes' : 'no'}
            onChange={(e) => onFiltersChange({ ...filters, hasRecurrence: e.target.value === '' ? undefined : e.target.value === 'yes' })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="yes">Sim</option>
            <option value="no">Não</option>
          </select>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">
            Indisponível para afiliação atualmente?
          </label>
          <select
            value={filters.onlyAvailable === undefined ? '' : filters.onlyAvailable ? 'no' : 'yes'}
            onChange={(e) => onFiltersChange({ ...filters, onlyAvailable: e.target.value === '' ? undefined : e.target.value === 'no' })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="yes">Sim, mostrar indisponíveis</option>
            <option value="no">Não, apenas disponíveis</option>
          </select>
        </div>

        <div>
          <label className="block text-label font-medium text-foreground mb-2">
            Apenas produtos com pág. de vendas funcionando?
          </label>
          <select
            value={filters.onlyWorkingSalesPage === undefined ? '' : filters.onlyWorkingSalesPage ? 'yes' : 'no'}
            onChange={(e) => onFiltersChange({ ...filters, onlyWorkingSalesPage: e.target.value === '' ? undefined : e.target.value === 'yes' })}
            className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-label focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Escolha</option>
            <option value="yes">Sim</option>
            <option value="no">Não</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-medium py-3 px-4 rounded-md transition-colors text-label"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
