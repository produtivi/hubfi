'use client'

import { useState } from 'react'
import { ArrowLeft, Star, Copy, Check, Loader2, Link } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GeneratedTitle {
  id: number
  content: string
  isFavorite: boolean
  createdAt: string
}

interface GeneratedDescription {
  id: number
  content: string
  isFavorite: boolean
  createdAt: string
}

interface Product {
  id: number
  name: string
  description: string
  links: string | null
  category: string | null
  titles: GeneratedTitle[]
  descriptions: GeneratedDescription[]
}

const PRODUCT_CATEGORIES = [
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
  'Outra'
]

export default function NovoHubTitle() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    links: '',
    category: ''
  })

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.description) {
      alert('Nome e descrição são obrigatórios')
      return
    }

    try {
      setIsCreating(true)

      // Criar produto
      const response = await fetch('/api/hubtitle/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: showCustomCategory ? customCategory : formData.category
        })
      })

      if (!response.ok) throw new Error('Erro ao criar produto')

      const newProduct = await response.json()

      // Gerar títulos e descrições
      const generateResponse = await fetch(`/api/hubtitle/products/${newProduct.id}/generate`, {
        method: 'POST'
      })

      if (!generateResponse.ok) throw new Error('Erro ao gerar conteúdo')

      // Buscar produto com títulos e descrições
      const productResponse = await fetch(`/api/hubtitle/products/${newProduct.id}`)
      const productWithContent = await productResponse.json()

      setCreatedProduct(productWithContent)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar produto')
    } finally {
      setIsCreating(false)
    }
  }

  const handleGenerateMore = async () => {
    if (!createdProduct) return

    try {
      setIsGenerating(true)
      const response = await fetch(`/api/hubtitle/products/${createdProduct.id}/generate`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Erro ao gerar conteúdo')

      // Buscar produto atualizado
      const productResponse = await fetch(`/api/hubtitle/products/${createdProduct.id}`)
      const updatedProduct = await productResponse.json()

      setCreatedProduct(updatedProduct)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao gerar mais conteúdo')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleFavoriteTitle = async (titleId: number, currentState: boolean) => {
    if (!createdProduct) return

    try {
      await fetch(`/api/hubtitle/titles/${titleId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentState })
      })

      setCreatedProduct({
        ...createdProduct,
        titles: createdProduct.titles.map(title =>
          title.id === titleId ? { ...title, isFavorite: !currentState } : title
        )
      })
    } catch (error) {
      console.error('Erro ao favoritar:', error)
    }
  }

  const handleToggleFavoriteDescription = async (descId: number, currentState: boolean) => {
    if (!createdProduct) return

    try {
      await fetch(`/api/hubtitle/descriptions/${descId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentState })
      })

      setCreatedProduct({
        ...createdProduct,
        descriptions: createdProduct.descriptions.map(desc =>
          desc.id === descId ? { ...desc, isFavorite: !currentState } : desc
        )
      })
    } catch (error) {
      console.error('Erro ao favoritar:', error)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateAnother = () => {
    setCreatedProduct(null)
    setFormData({ name: '', description: '', links: '', category: '' })
    setShowCustomCategory(false)
    setCustomCategory('')
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/hubtitle')}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-headline">Novo Produto</h1>
        </div>

        {createdProduct && (
          <div className="flex gap-2">
            <button
              onClick={handleCreateAnother}
              className="px-4 py-2 bg-background border border-border hover:bg-accent rounded-md transition-colors text-body"
            >
              Criar Outro Produto
            </button>
            <button
              onClick={() => router.push('/hubtitle')}
              className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-80 rounded-md transition-opacity text-body"
            >
              Ver Todos os Produtos
            </button>
          </div>
        )}
      </div>

      {!createdProduct ? (
        <div className="bg-card border border-border rounded-md p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-body font-medium mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-body"
                placeholder="Ex: Curso de Marketing Digital"
              />
            </div>

            <div>
              <label className="block text-body font-medium mb-2">
                Descrição do Produto *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-body min-h-[120px]"
                placeholder="Descreva seu produto em detalhes..."
              />
            </div>

            <div>
              <label className="block text-body font-medium mb-2">
                Links (opcional)
              </label>
              <input
                type="text"
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-body"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-body font-medium mb-2">
                Categoria (opcional)
              </label>
              <select
                value={showCustomCategory ? 'Outra' : formData.category}
                onChange={(e) => {
                  if (e.target.value === 'Outra') {
                    setShowCustomCategory(true)
                    setFormData({ ...formData, category: '' })
                  } else {
                    setShowCustomCategory(false)
                    setFormData({ ...formData, category: e.target.value })
                  }
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-body"
              >
                <option value="">Selecione uma categoria</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {showCustomCategory && (
              <div>
                <label className="block text-body font-medium mb-2">
                  Especifique a categoria
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-body"
                  placeholder="Digite a categoria..."
                />
              </div>
            )}

            <button
              onClick={handleCreateProduct}
              disabled={isCreating || !formData.name || !formData.description}
              className="w-full py-3 bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-opacity text-body font-medium flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando e gerando conteúdo...
                </>
              ) : (
                'Criar e Gerar Títulos/Descrições'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Info do Produto */}
          <div className="bg-card border border-border rounded-md p-6">
            <h2 className="text-title mb-4">{createdProduct.name}</h2>
            <p className="text-body text-muted-foreground mb-2">{createdProduct.description}</p>
            {createdProduct.category && (
              <p className="text-label text-muted-foreground">
                Categoria: {createdProduct.category}
              </p>
            )}
            {createdProduct.links && (
              <p className="text-label text-muted-foreground mt-1 flex gap-1 items-center">
                <Link className='h-4 w-4 opacity-50' />{createdProduct.links}
              </p>
            )}
          </div>

          {/* Botão Gerar Mais */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateMore}
              disabled={isGenerating}
              className="px-6 py-3 bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-opacity text-body font-medium flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                `Gerar Mais 5`
              )}
            </button>
          </div>

          {/* Títulos */}
          {createdProduct.titles.length > 0 && (
            <div className="bg-card border border-border rounded-md p-6">
              <h3 className="text-title mb-4">
                Títulos ({createdProduct.titles.length})
              </h3>
              <div className="space-y-2">
                {createdProduct.titles
                  .sort((a, b) => {
                    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  })
                  .map((title) => (
                    <div
                      key={title.id}
                      className="p-3 bg-background border border-border rounded-md hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <p className="flex-1 text-body">{title.content}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleFavoriteTitle(title.id, title.isFavorite)}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            title="Favoritar"
                          >
                            <Star
                              className={`w-4 h-4 ${title.isFavorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                                }`}
                            />
                          </button>
                          <button
                            onClick={() => handleCopy(title.content, `title-${title.id}`)}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            title="Copiar"
                          >
                            {copiedId === `title-${title.id}` ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Descrições */}
          {createdProduct.descriptions.length > 0 && (
            <div className="bg-card border border-border rounded-md p-6">
              <h3 className="text-title mb-4">
                Descrições ({createdProduct.descriptions.length})
              </h3>
              <div className="space-y-2">
                {createdProduct.descriptions
                  .sort((a, b) => {
                    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  })
                  .map((desc) => (
                    <div
                      key={desc.id}
                      className="p-3 bg-background border border-border rounded-md hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <p className="flex-1 text-body">{desc.content}</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleFavoriteDescription(desc.id, desc.isFavorite)}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            title="Favoritar"
                          >
                            <Star
                              className={`w-4 h-4 ${desc.isFavorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                                }`}
                            />
                          </button>
                          <button
                            onClick={() => handleCopy(desc.content, `desc-${desc.id}`)}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            title="Copiar"
                          >
                            {copiedId === `desc-${desc.id}` ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
