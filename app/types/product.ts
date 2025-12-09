export type ProductTemperature = 'hot' | 'warm' | 'cold';
export type Platform = 'hotmart' | 'braip' | 'clickbank' | 'buygoods' | 'kiwify' | 'monetizze' | 'digistoresa' | 'perfectpay' | 'drcash' | 'gurumedia' | 'maxweb';
export type Niche = 'saude' | 'relacionamento' | 'dinheiro' | 'espiritualidade' | 'educacao' | 'moda-beleza' | 'musica-artes' | 'outros';
export type Language = 'pt' | 'en' | 'es';
export type Currency = 'BRL' | 'USD' | 'EUR';
export type AffiliationType = 'cpa' | 'cpl' | 'revshare';

export interface Product {
  id: string;
  name: string;
  creator: string;
  score: number;
  reviewCount: number;
  temperature: number;
  commissionPercent: number;
  commissionValue: number;
  price: number;
  platform: Platform;
  niche: Niche;
  salesPageUrl: string;
  thumbnailUrl?: string;
  language: Language;
  currency: Currency;
  hasRecurrence: boolean;
  isAvailableForAffiliation: boolean;
  blueprintRate?: number;
  hotleads: boolean;
  addedDate: Date;
}

export interface ProductFilters {
  platforms?: Platform[];
  niche?: Niche;
  language?: Language;
  currency?: Currency;
  temperatureMin?: number;
  temperatureMax?: number;
  priceMin?: number;
  priceMax?: number;
  commissionValueMin?: number;
  commissionValueMax?: number;
  commissionPercentMin?: number;
  commissionPercentMax?: number;
  minReviews?: number;
  minScore?: number;
  blueprintRateMin?: number;
  affiliationType?: AffiliationType;
  hotleads?: boolean;
  hasRecurrence?: boolean;
  onlyAvailable?: boolean;
  onlyWorkingSalesPage?: boolean;
  searchContains?: string;
  searchNotContains?: string;
}
