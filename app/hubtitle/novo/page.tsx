'use client'

import { useState } from 'react'
import { ArrowLeft } from '@untitledui/icons'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { Select } from '@/components/base/select/select'
import { Label } from '@/components/base/input/label'

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
          <Button
            size="md"
            color="tertiary"
            iconLeading={ArrowLeft}
            onClick={handleCancel}
          />
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
              <div>
                <Input
                  size="md"
                  label="Nome do Produto"
                  placeholder="Ex: Curso de Marketing Digital"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  isRequired
                />
              </div>

              {/* Categoria */}
              <div>
                <Select
                  size="md"
                  label="Categoria"
                  placeholder="Selecione uma categoria"
                  selectedKey={showCustomCategory ? 'Outra' : formData.category || ''}
                  onSelectionChange={(key) => {
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
                  {(item) => <Select.Item>{item.label}</Select.Item>}
                </Select>
              </div>

              {/* Descrição do Produto - Span 2 colunas */}
              <div className="md:col-span-2">
                <Label isRequired>Descrição do Produto</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu produto em detalhes para gerar títulos e descrições mais precisos..."
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[120px] resize-none shadow-xs"
                  required
                />
              </div>

              {/* Links */}
              <div className="md:col-span-2">
                <Input
                  size="md"
                  label="Links do Produto"
                  type="url"
                  placeholder="https://..."
                  value={formData.links}
                  onChange={(value) => setFormData({ ...formData, links: value })}
                />
              </div>

              {/* Categoria customizada - condicional */}
              {showCustomCategory && (
                <div className="md:col-span-2">
                  <Input
                    size="md"
                    label="Especifique a categoria"
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
