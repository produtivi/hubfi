'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { Select } from '@/components/base/select/select'
import { TooltipHelp } from '@/components/ui/tooltip-help'
import type { Key } from 'react-aria-components'

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
    <div className="min-h-screen p-6 md:p-8">
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
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nome do Produto <span className="text-destructive">*</span>
                  <TooltipHelp text="Nome do produto que será usado para gerar títulos e descrições." />
                </span>
                <Input
                  size="md"
                  placeholder="Ex: Curso de Marketing Digital"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  isRequired
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Categoria
                  <TooltipHelp text="Categoria do produto para gerar conteúdo mais relevante." />
                </span>
                <Select
                  size="md"
                  placeholder="Selecione uma categoria"
                  selectedKey={showCustomCategory ? 'Outra' : formData.category || null}
                  onSelectionChange={(key: Key | null) => {
                    const value = key?.toString() || ''
                    if (value === 'Outra') {
                      setShowCustomCategory(true)
                      setFormData({ ...formData, category: '' })
                    } else {
                      setShowCustomCategory(false)
                      setFormData({ ...formData, category: value })
                    }
                  }}
                  items={PRODUCT_CATEGORIES.map(cat => ({ id: cat, label: cat }))}
                >
                  {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                </Select>
              </div>

              {/* Descrição do Produto - Span 2 colunas */}
              <div className="md:col-span-2 space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Descrição do Produto <span className="text-destructive">*</span>
                  <TooltipHelp text="Descreva seu produto em detalhes para gerar títulos e descrições mais precisos." />
                </span>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu produto em detalhes para gerar títulos e descrições mais precisos..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[120px] resize-none shadow-xs"
                  required
                />
              </div>

              {/* Links */}
              <div className="md:col-span-2 space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Links do Produto
                  <TooltipHelp text="Link da página de vendas ou checkout do produto (opcional)." />
                </span>
                <Input
                  size="md"
                  type="url"
                  placeholder="https://..."
                  value={formData.links}
                  onChange={(value) => setFormData({ ...formData, links: value })}
                />
              </div>

              {/* Categoria customizada - condicional */}
              {showCustomCategory && (
                <div className="md:col-span-2 space-y-1">
                  <span className="text-body font-medium flex items-center gap-2">
                    Especifique a categoria
                    <TooltipHelp text="Digite uma categoria personalizada para o produto." />
                  </span>
                  <Input
                    size="md"
                    placeholder="Digite a categoria..."
                    value={customCategory}
                    onChange={(value) => setCustomCategory(value)}
                  />
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                size="lg"
                color="secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancelar
              </Button>

              <Button
                size="lg"
                color="primary"
                type="submit"
                isDisabled={isCreating || !formData.name || !formData.description}
                isLoading={isCreating}
                 className='p-2 md:p-2'
              >
                Criar e Gerar Conteúdo
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
