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
  review: {
    label: 'Página de Review',
    description: 'Página de análise e avaliação de produtos'
  },
  cloned: {
    label: 'Página Clonada',
    description: 'Cópia de uma página existente'
  },
  'top-funnel': {
    label: 'Topo de Funil',
    description: 'Página para captação de tráfego no topo do funil'
  }
};
