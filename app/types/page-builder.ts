export type PageType = 'presell' | 'cloned' | 'review' | 'top-funnel';

export type PageStatus = 'published' | 'draft' | 'offline';

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
    description: 'Clone de páginas existentes para testes A/B'
  },
  review: {
    label: 'Página de Review',
    description: 'Página de análise e avaliação de produtos'
  },
  'top-funnel': {
    label: 'Página Topo de Funil',
    description: 'Conteúdo educativo para captura de leads'
  }
};
