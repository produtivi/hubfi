'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy07 as Copy, Check, Star01 as Star, Trash03 as Trash2, Link03 as Link, SearchLg as Search, RefreshCcw01 as RefreshCcw } from '@untitledui/icons'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { Select } from '@/components/base/select/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Toast } from '@/components/ui/toast'

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
  const [sortBy, setSortBy] = useState('recent')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [toasts, setToasts] = useState<{ id: string, type: 'success' | 'error' | 'info', message: string }[]>([])

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

  const filteredAndSortedProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.id - a.id // Mais recentes primeiro
        case 'oldest':
          return a.id - b.id // Mais antigos primeiro
        case 'most-titles':
          return b.titles.length - a.titles.length // Mais títulos primeiro
        case 'most-favorites':
          const aFavs = a.titles.filter(t => t.isFavorite).length + a.descriptions.filter(d => d.isFavorite).length
          const bFavs = b.titles.filter(t => t.isFavorite).length + b.descriptions.filter(d => d.isFavorite).length
          return bFavs - aFavs // Mais favoritos primeiro
        case 'name-az':
          return a.name.localeCompare(b.name) // A-Z
        case 'name-za':
          return b.name.localeCompare(a.name) // Z-A
        default:
          return 0
      }
    })

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
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

        showToast('success', '5 novos títulos e descrições gerados com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao gerar mais:', error)
      showToast('error', 'Erro ao gerar conteúdo. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleFavoriteTitle = async (titleId: number, currentState: boolean) => {
    // Optimistic update - atualiza UI imediatamente
    const newState = !currentState

    setProducts(products.map(product => ({
      ...product,
      titles: product.titles.map(title =>
        title.id === titleId ? { ...title, isFavorite: newState } : title
      )
    })))

    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        titles: selectedProduct.titles.map(title =>
          title.id === titleId ? { ...title, isFavorite: newState } : title
        )
      })
    }

    // Faz a requisição em background
    try {
      await fetch(`/api/hubtitle/titles/${titleId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newState })
      })
    } catch (error) {
      // Reverte se der erro
      console.error('Erro ao favoritar:', error)
      setProducts(products.map(product => ({
        ...product,
        titles: product.titles.map(title =>
          title.id === titleId ? { ...title, isFavorite: currentState } : title
        )
      })))

      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          titles: selectedProduct.titles.map(title =>
            title.id === titleId ? { ...title, isFavorite: currentState } : title
          )
        })
      }
    }
  }

  const handleToggleFavoriteDescription = async (descId: number, currentState: boolean) => {
    // Optimistic update - atualiza UI imediatamente
    const newState = !currentState

    setProducts(products.map(product => ({
      ...product,
      descriptions: product.descriptions.map(desc =>
        desc.id === descId ? { ...desc, isFavorite: newState } : desc
      )
    })))

    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        descriptions: selectedProduct.descriptions.map(desc =>
          desc.id === descId ? { ...desc, isFavorite: newState } : desc
        )
      })
    }

    // Faz a requisição em background
    try {
      await fetch(`/api/hubtitle/descriptions/${descId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newState })
      })
    } catch (error) {
      // Reverte se der erro
      console.error('Erro ao favoritar:', error)
      setProducts(products.map(product => ({
        ...product,
        descriptions: product.descriptions.map(desc =>
          desc.id === descId ? { ...desc, isFavorite: currentState } : desc
        )
      })))

      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          descriptions: selectedProduct.descriptions.map(desc =>
            desc.id === descId ? { ...desc, isFavorite: currentState } : desc
          )
        })
      }
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await fetch(`/api/hubtitle/products/${productToDelete}`, {
        method: 'DELETE'
      })

      setProducts(products.filter(p => p.id !== productToDelete))
      if (selectedProduct?.id === productToDelete) {
        setSelectedProduct(null)
      }
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      showToast('success', 'Produto deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar:', error)
      showToast('error', 'Erro ao deletar produto. Tente novamente.')
    }
  }

  const openDeleteDialog = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      showToast('success', 'Copiado para a área de transferência!')
    } catch (error) {
      console.error('Erro ao copiar:', error)
      showToast('error', 'Erro ao copiar. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-headline mb-2">HubTitle</h1>
        <p className="text-body-muted">
          Gerencie e gere títulos e descrições para seus produtos
        </p>
      </div>

      {/* Barra de busca e ações */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Input de busca */}
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Buscar produtos por nome..."
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
          />
        </div>

        {/* Ordenação e botão criar */}
        <div className="flex gap-3">
          <div className="w-full">
            <Select
              placeholder="Ordenar por"
              defaultSelectedKey={sortBy}
              onSelectionChange={(key) => setSortBy(key?.toString() || 'recent')}
              items={[
                { id: 'recent', label: 'Mais recentes' },
                { id: 'oldest', label: 'Mais antigos' },
                { id: 'most-titles', label: 'Mais títulos' },
                { id: 'most-favorites', label: 'Mais favoritos' },
                { id: 'name-az', label: 'Nome (A-Z)' },
                { id: 'name-za', label: 'Nome (Z-A)' }
              ]}
              className="flex-1 md:flex-none"
            >
              {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
            </Select>
          </div>

          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => router.push('/hubtitle/novo')}
            className="flex-1 md:flex-none"
          >
            Criar novo produto
          </Button>
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

              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body-muted">
                    {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto criado ainda'}
                  </p>
                  {!searchQuery && (
                    <p className="text-label text-muted-foreground mt-2">
                      Clique em &quot;Criar novo produto&quot; para começar
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSortedProducts.map((product) => (
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
                          {(() => {
                            const favCount = product.titles.filter((t) => t.isFavorite).length +
                              product.descriptions.filter((d) => d.isFavorite).length;
                            return (
                              <p className="text-label text-muted-foreground flex items-center gap-1 mt-1">
                                <Star className={`size-4 text-yellow-400 ${favCount > 0 ? 'fill-yellow-400' : ''}`} />{' '}
                                {favCount} favoritos
                              </p>
                            );
                          })()}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteDialog(product.id)
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                          title="Deletar produto"
                        >
                          <Trash2 className="size-4 text-destructive border-gray-200 md:border-0" />
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
                      <Link className="size-4 text-muted-foreground" />
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
                  <Button
                    size="md"
                    color="primary"
                    iconLeading={RefreshCcw}
                    onClick={() => handleGenerateMore(selectedProduct.id)}
                    isDisabled={isGenerating}
                    isLoading={isGenerating}
                  >
                    Gerar Mais 5
                  </Button>
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
                                        className={`size-4 ${
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
                                      <Check className="size-4 text-success" />
                                    ) : (
                                      <Copy className="size-4 text-muted-foreground" />
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
                                        className={`size-4 ${
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
                                      <Check className="size-4 text-success" />
                                    ) : (
                                      <Copy className="size-4 text-muted-foreground" />
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

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-body text-muted-foreground">
              Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita e todos os títulos e descrições gerados serão perdidos.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                size="md"
                color="secondary"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setProductToDelete(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                size="md"
                color="primary-destructive"
                onClick={handleDeleteProduct}
              >
                Deletar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }}
            >
              <Toast
                type={toast.type}
                message={toast.message}
                isVisible={true}
                onClose={() => removeToast(toast.id)}
                duration={4000}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
