'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Copy, Check, Star, Trash2, Link } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  description: string
  links: string | null
  category: string | null
  titles: Title[]
  descriptions: Description[]
}

interface Title {
  id: number
  content: string
  isFavorite: boolean
  createdAt: string
}

interface Description {
  id: number
  content: string
  isFavorite: boolean
  createdAt: string
}

export default function HubTitlePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/hubtitle/products')
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateMore = async (productId: number) => {
    try {
      setIsGenerating(true)
      const response = await fetch(`/api/hubtitle/products/${productId}/generate`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar conteúdo')
      }

      const productResponse = await fetch(`/api/hubtitle/products/${productId}`)
      if (productResponse.ok) {
        const updatedProduct = await productResponse.json()

        setProducts(prev => prev.map(p =>
          p.id === productId ? updatedProduct : p
        ))

        if (selectedProduct?.id === productId) {
          setSelectedProduct(updatedProduct)
        }
      }
    } catch (error) {
      console.error('Erro ao gerar mais:', error)
      alert('Erro ao gerar conteúdo')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleFavoriteTitle = async (titleId: number, currentState: boolean) => {
    try {
      await fetch(`/api/hubtitle/titles/${titleId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentState })
      })

      setProducts(products.map(product => ({
        ...product,
        titles: product.titles.map(title =>
          title.id === titleId ? { ...title, isFavorite: !currentState } : title
        )
      })))

      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          titles: selectedProduct.titles.map(title =>
            title.id === titleId ? { ...title, isFavorite: !currentState } : title
          )
        })
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
    }
  }

  const handleToggleFavoriteDescription = async (descId: number, currentState: boolean) => {
    try {
      await fetch(`/api/hubtitle/descriptions/${descId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentState })
      })

      setProducts(products.map(product => ({
        ...product,
        descriptions: product.descriptions.map(desc =>
          desc.id === descId ? { ...desc, isFavorite: !currentState } : desc
        )
      })))

      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          descriptions: selectedProduct.descriptions.map(desc =>
            desc.id === descId ? { ...desc, isFavorite: !currentState } : desc
          )
        })
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      await fetch(`/api/hubtitle/products/${productId}`, {
        method: 'DELETE'
      })

      setProducts(products.filter(p => p.id !== productId))
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null)
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar produto')
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline">HubTitle - Gerador de Títulos</h1>
        <button
          onClick={() => router.push('/hubtitle/novo')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-80 rounded-md transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de Produtos */}
          <div className="lg:col-span-1 sticky top-6 self-start">
            <div className="bg-card border border-border rounded-md p-4">
              <h2 className="text-title mb-4">Meus Produtos</h2>

              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body-muted">Nenhum produto criado ainda</p>
                  <p className="text-label text-muted-foreground mt-2">
                    Clique em &quot;Novo Produto&quot; para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`w-full text-left p-3 rounded-md border transition-colors cursor-pointer ${selectedProduct?.id === product.id
                        ? 'bg-accent border-primary'
                        : 'bg-background border-border hover:bg-accent'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-body font-medium truncate">{product.name}</p>
                          <p className="text-label text-muted-foreground mt-1">
                            {product.titles.length} títulos • {product.descriptions.length} descrições
                          </p>
                          <p className="text-label text-muted-foreground flex items-center gap-1 mt-1">
                            <Star className='text-yellow-400 w-4 h-4 ' /> {product.titles.filter(t => t.isFavorite).length} favoritos
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProduct(product.id)
                          }}
                          className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                          title="Deletar produto"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área Principal - Detalhes do Produto */}
          <div className="lg:col-span-3">
            {!selectedProduct ? (
              <div className="bg-card border border-border rounded-md p-12 text-center">
                <p className="text-body text-muted-foreground">
                  Selecione um produto para ver os títulos e descrições
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Info do Produto */}
                <div className="bg-card border border-border rounded-md p-6">
                  <h2 className="text-title mb-2">{selectedProduct.name}</h2>
                  <p className="text-body text-muted-foreground">{selectedProduct.description}</p>
                  {selectedProduct.category && (
                    <p className="text-label text-muted-foreground mt-2">
                      Categoria: {selectedProduct.category}
                    </p>
                  )}
                  {selectedProduct.links && (
                    <p className="text-label text-muted-foreground w-full word-break mt-1 flex gap-1 items-center">
                      <Link className='h-4 w-4 opacity-50' /> <span className=' w-full truncate'> {selectedProduct.links}</span>
                    </p>
                  )}
                </div>

                {/* Botão Gerar Mais */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleGenerateMore(selectedProduct.id)}
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
                {selectedProduct.titles.length > 0 && (
                  <div className="bg-card border border-border rounded-md p-6">
                    <h3 className="text-title mb-4">
                      Títulos ({selectedProduct.titles.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedProduct.titles
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
                {selectedProduct.descriptions.length > 0 && (
                  <div className="bg-card border border-border rounded-md p-6">
                    <h3 className="text-title mb-4">
                      Descrições ({selectedProduct.descriptions.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedProduct.descriptions
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
        </div>
      )}
    </div>
  )
}
