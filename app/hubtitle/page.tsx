'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Copy, Check, Star, Trash2, Link, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (showFavorites) {
      const hasFavoriteTitles = product.titles.some(t => t.isFavorite)
      const hasFavoriteDescriptions = product.descriptions.some(d => d.isFavorite)
      return matchesSearch && (hasFavoriteTitles || hasFavoriteDescriptions)
    }
    return matchesSearch
  })

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
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-headline mb-2">HubTitle</h1>
        <p className="text-body-muted">
          Gerencie e gere títulos e descrições para seus produtos
        </p>
      </div>

      {/* Barra de busca e ações */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Input de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar produtos por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-md text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
              showFavorites
                ? 'bg-accent text-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>{showFavorites ? 'Favoritos' : 'Todos'}</span>
          </button>

          <button
            onClick={() => router.push('/hubtitle/novo')}
            className="flex items-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Criar novo produto</span>
          </button>
        </div>
      </div>

      {/* Layout principal */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground">
            Carregando produtos...
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de Produtos */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card border border-border rounded-md p-4">
              <h2 className="text-title mb-4">Meus Produtos</h2>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body-muted">
                    {showFavorites ? 'Nenhum favorito encontrado' : 'Nenhum produto criado ainda'}
                  </p>
                  {!showFavorites && (
                    <p className="text-label text-muted-foreground mt-2">
                      Clique em &quot;Criar novo produto&quot; para começar
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`w-full text-left p-3 rounded-md border transition-colors cursor-pointer ${
                        selectedProduct?.id === product.id
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
                            <Star className="text-yellow-400 w-4 h-4" />{' '}
                            {product.titles.filter((t) => t.isFavorite).length +
                              product.descriptions.filter((d) => d.isFavorite).length}{' '}
                            favoritos
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
                    <p className="text-label text-muted-foreground mt-2">Categoria: {selectedProduct.category}</p>
                  )}
                  {selectedProduct.links && (
                    <div className="flex items-center gap-1 mt-2">
                      <Link className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={selectedProduct.links}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-label text-muted-foreground hover:text-foreground transition-colors truncate"
                        title={selectedProduct.links}
                      >
                        {selectedProduct.links}
                      </a>
                    </div>
                  )}
                </div>

                {/* Botão Gerar Mais */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleGenerateMore(selectedProduct.id)}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-opacity text-body font-medium flex items-center gap-2"
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
                    <h3 className="text-title mb-4">Títulos ({selectedProduct.titles.length})</h3>
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {selectedProduct.titles
                          .sort((a, b) => {
                            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          })
                          .map((title) => (
                            <motion.div
                              key={title.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{
                                layout: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                                y: { duration: 0.2 }
                              }}
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
                                    <motion.div
                                      key={title.isFavorite ? 'filled' : 'empty'}
                                      initial={{ scale: 0.8, rotate: -30 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          title.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                        }`}
                                      />
                                    </motion.div>
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
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Descrições */}
                {selectedProduct.descriptions.length > 0 && (
                  <div className="bg-card border border-border rounded-md p-6">
                    <h3 className="text-title mb-4">Descrições ({selectedProduct.descriptions.length})</h3>
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {selectedProduct.descriptions
                          .sort((a, b) => {
                            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          })
                          .map((desc) => (
                            <motion.div
                              key={desc.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{
                                layout: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                                y: { duration: 0.2 }
                              }}
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
                                    <motion.div
                                      key={desc.isFavorite ? 'filled' : 'empty'}
                                      initial={{ scale: 0.8, rotate: -30 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          desc.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                        }`}
                                      />
                                    </motion.div>
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
                            </motion.div>
                          ))}
                      </AnimatePresence>
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
