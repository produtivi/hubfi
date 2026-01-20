export interface ProductFormData {
  productName: string
  description: string
  links: string
  category: string
}

export interface GeneratedContent {
  id: string
  content: string
  isFavorite: boolean
}

export interface TitleGeneratorResponse {
  titles: string[]
  descriptions: string[]
}

export const PRODUCT_CATEGORIES = [
  'Saúde e Bem-estar',
  'Relacionamento',
  'Dinheiro e Investimentos',
  'Educação',
  'Desenvolvimento Pessoal',
  'Tecnologia',
  'Marketing Digital',
  'E-commerce',
  'Fitness',
  'Culinária',
  'Artesanato',
  'Idiomas',
  'Música',
  'Design',
  'Fotografia',
  'Outros'
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]
