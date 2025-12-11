import { Search, Filter } from 'lucide-react';
import type { ProductFilters, Niche, Platform } from '../types/product';

interface ProductFiltersBarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFiltersBar({ filters, onFiltersChange }: ProductFiltersBarProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, searchContains: search || undefined });
  };

  const handleNicheChange = (niche: string) => {
    onFiltersChange({ ...filters, niche: niche as Niche || undefined });
  };

  const handlePlatformChange = (platform: string) => {
    onFiltersChange({ ...filters, platforms: platform ? [platform as Platform] : undefined });
  };

  const handleTemperatureMinChange = (temperature: string) => {
    const temp = temperature ? parseFloat(temperature) : undefined;
    onFiltersChange({ ...filters, temperatureMin: temp });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="text-gray-600 w-5 h-5" />
        <h2 className="font-semibold text-gray-900">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
            Nicho
          </label>
          <select
            id="niche"
            value={filters.niche || ''}
            onChange={(e) => handleNicheChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Todos os nichos</option>
            <option value="saude">Saúde</option>
            <option value="relacionamento">Relacionamento</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="espiritualidade">Espiritualidade</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
            Plataforma
          </label>
          <select
            id="platform"
            value={filters.platforms?.[0] || ''}
            onChange={(e) => handlePlatformChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Todas as plataformas</option>
            <option value="hotmart">Hotmart</option>
            <option value="monetizze">Monetizze</option>
            <option value="eduzz">Eduzz</option>
            <option value="kiwify">Kiwify</option>
            <option value="braip">Braip</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura
          </label>
          <input
            id="temperature"
            type="number"
            value={filters.temperatureMin || ''}
            onChange={(e) => handleTemperatureMinChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Ex: 50"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 mb-1">
            Score mínimo
          </label>
          <input
            id="minScore"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={filters.minScore || ''}
            onChange={(e) => onFiltersChange({ ...filters, minScore: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Ex: 7.5"
          />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={filters.searchContains || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nome do produto..."
          className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
    </div>
  );
}
