export type PageType = 'presell' | 'cloned' | 'review' | 'top-funnel';

export type PageStatus = 'published' | 'draft' | 'offline' | 'archived';

export interface Page {
  id: string;
  name: string;
  type: PageType;
  domain: string;
  status: PageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Domain {
  id: string;
  domain: string;
  status: PageStatus;
  createdAt: Date;
  nameservers?: string[];
}

export const PAGE_TYPES: Record<PageType, { label: string; description: string }> = {
  presell: {
    label: 'Presell',
    description: 'Página de pré-venda para aquecer o tráfego antes da oferta'
  },
  cloned: {
    label: 'Página Clonada',
    description: 'Página duplicada de outra existente'
  },
  review: {
    label: 'Página de Review',
    description: 'Página de análise e avaliação de produtos'
  },
  'top-funnel': {
    label: 'Top Funil',
    description: 'Página para captura no topo do funil'
  }
};
