'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    links: '',
    category: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      await fetch(`/api/hubtitle/products/${newProduct.id}/generate`, {
        method: 'POST'
      })

      // Redirecionar para a listagem
      router.push('/hubtitle')

    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar produto')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-headline">Criar Novo Produto</h1>
            <p className="text-label text-muted-foreground">
              Preencha as informações do produto para gerar títulos e descrições
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nome do Produto */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Nome do Produto <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Curso de Marketing Digital"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Categoria */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Categoria
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Selecione uma categoria</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Descrição do Produto - Span 2 colunas */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-body font-medium">
                  Descrição do Produto <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu produto em detalhes para gerar títulos e descrições mais precisos..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[120px] resize-none"
                  required
                />
              </div>

              {/* Links */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-body font-medium">
                  Links do Produto
                </label>
                <input
                  type="url"
                  value={formData.links}
                  onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Categoria customizada - condicional */}
              {showCustomCategory && (
                <div className="space-y-3 md:col-span-2">
                  <label className="text-body font-medium">
                    Especifique a categoria
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Digite a categoria..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-border bg-background hover:bg-accent text-foreground rounded-md transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isCreating || !formData.name || !formData.description}
                className="flex items-center gap-2 px-8 py-3 rounded-md transition-colors font-medium bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isCreating && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isCreating ? 'Criando e gerando...' : 'Criar e Gerar Conteúdo'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
