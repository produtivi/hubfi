'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageType, PAGE_TYPES } from '@/app/types/page-builder';

interface PageFiltersProps {
  onFilterTypeChange: (type: PageType | 'all') => void;
  onFilterDomainChange: (domain: string | 'all') => void;
  domains: string[];
}

export function PageFilters({ onFilterTypeChange, onFilterDomainChange, domains }: PageFiltersProps) {
  const [selectedType, setSelectedType] = useState<PageType | 'all'>('all');
  const [selectedDomain, setSelectedDomain] = useState<string | 'all'>('all');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);

  const handleTypeChange = (type: PageType | 'all') => {
    setSelectedType(type);
    onFilterTypeChange(type);
    setTypeDropdownOpen(false);
  };

  const handleDomainChange = (domain: string | 'all') => {
    setSelectedDomain(domain);
    onFilterDomainChange(domain);
    setDomainDropdownOpen(false);
  };

  return (
    <div className="flex gap-6 mb-6">
      {/* Filtro por tipo */}
      <div className="flex-1">
        <label className="block text-label text-foreground mb-2">
          Filtre por tipo de página
        </label>
        <div className="relative">
          <button
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-md text-body text-foreground hover:bg-accent transition-colors"
          >
            <span>
              {selectedType === 'all' ? 'Ver todos os tipos' : PAGE_TYPES[selectedType].label}
            </span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>

          {typeDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-xl z-10 overflow-hidden">
              <button
                onClick={() => handleTypeChange('all')}
                className="w-full px-4 py-3 text-left text-body hover:bg-accent transition-colors"
              >
                Ver todos os tipos
              </button>
              {Object.entries(PAGE_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key as PageType)}
                  className="w-full px-4 py-3 text-left text-body hover:bg-accent transition-colors"
                >
                  {value.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtro por domínio */}
      <div className="flex-1">
        <label className="block text-label text-foreground mb-2">
          Filtre por domínio
        </label>
        <div className="relative">
          <button
            onClick={() => setDomainDropdownOpen(!domainDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-md text-body text-foreground hover:bg-accent transition-colors"
          >
            <span>
              {selectedDomain === 'all' ? 'Ver todos os domínios' : selectedDomain}
            </span>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>

          {domainDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-xl z-10 overflow-hidden max-h-64 overflow-y-auto">
              <button
                onClick={() => handleDomainChange('all')}
                className="w-full px-4 py-3 text-left text-body hover:bg-accent transition-colors"
              >
                Ver todos os domínios
              </button>
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleDomainChange(domain)}
                  className="w-full px-4 py-3 text-left text-body hover:bg-accent transition-colors"
                >
                  {domain}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
