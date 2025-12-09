export type ProductType = 'fisico' | 'digital';

export type CampaignNiche = 'dental' | 'saude' | 'relacionamento' | 'dinheiro' | 'espiritualidade' | 'educacao' | 'moda-beleza' | 'musica-artes' | 'outros';

export type CampaignLanguage =
  | 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh'
  | 'ru' | 'ar' | 'hi' | 'nl' | 'sv' | 'no' | 'da' | 'fi' | 'pl'
  | 'tr' | 'th' | 'vi' | 'id' | 'ms' | 'tl' | 'cs' | 'hu' | 'ro'
  | 'uk' | 'el' | 'he' | 'fa' | 'ur' | 'bn' | 'ta' | 'te' | 'mr';

export type CampaignCurrency =
  | 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'CAD'
  | 'AUD' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'NZD' | 'ZAR' | 'MXN'
  | 'SGD' | 'HKD' | 'KRW' | 'TRY' | 'RUB' | 'PLN' | 'THB' | 'IDR'
  | 'MYR' | 'PHP' | 'CZK' | 'HUF' | 'RON' | 'ILS' | 'CLP' | 'ARS'
  | 'COP' | 'PEN' | 'VND' | 'EGP' | 'NGN' | 'PKR' | 'BDT' | 'AED';

export type CampaignStrategy = 'maximizar-cliques' | 'maximizar-conversoes' | 'cpa-alvo' | 'roas-alvo';

export type MatchType = 'exata' | 'frase' | 'ampla';

export interface ProductOffer {
  fullPrice: number;
  discountPrice: number;
  quantity: number;
  treatmentDays: number;
}

export interface ProductInfo {
  name: string;
  type: ProductType;
  niche: CampaignNiche;
  language: CampaignLanguage;
  currency: CampaignCurrency;
  offers: {
    simple?: ProductOffer;
    medium?: ProductOffer;
    best?: ProductOffer;
  };
  warrantyDays?: number;
  skipOfferInfo: boolean;
  skipWarrantyInfo: boolean;
}

export interface GoogleAdsAccount {
  gmailAccounts: string[];
  createNewMCC: boolean;
  mccAccount?: string;
  createNewConversionAction: boolean;
  conversionAction?: string;
  createNewAdsAccount: boolean;
  adsAccount?: string;
}

export interface CampaignConfig {
  name: string;
  strategy: CampaignStrategy;
  country: string;
  maxCPC?: number;
  maxDailyBudget?: number;
  targetCPA?: number;
  targetROAS?: number;
}

export interface Keyword {
  text: string;
  matchType: MatchType;
}

export interface AdTitle {
  text: string;
}

export interface AdDescription {
  text: string;
}

export interface AdHeadline {
  text: string;
}

export interface Sitelink {
  title: string;
  description1: string;
  description2: string;
  url: string;
}

export interface PriceExtension {
  title: string;
  description: string;
  price: number;
}

export interface Promotion {
  text: string;
  type: 'percentual' | 'valor';
}

export interface CampaignAssets {
  bidStrategy: CampaignStrategy;
  keywords: Keyword[];
  titles: AdTitle[];
  descriptions: AdDescription[];
  headlines: AdHeadline[];
  sitelinks: Sitelink[];
  priceExtensions: PriceExtension[];
  promotions: Promotion[];
}

export interface CampaignData {
  productInfo: ProductInfo;
  googleAdsAccount: GoogleAdsAccount;
  campaignConfig: CampaignConfig;
  campaignAssets: CampaignAssets;
  isFilteringEnabled: boolean;
  filterDomain?: string;
  urlComplement1?: string;
  urlComplement2?: string;
}

export type CampaignFormStep = 'product-info' | 'google-ads-setup' | 'campaign-config' | 'review';
