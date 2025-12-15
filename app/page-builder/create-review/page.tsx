'use client';

import { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateReview() {
  const router = useRouter();
  const [isAwareOfAI, setIsAwareOfAI] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    pageName: '',
    productName: '',
    affiliateLink: '',
    producerSalesPage: '',
    productType: '',
    niche: ''
  });

  const domains = [
    'dominio1.com.br',
    'dominio2.com.br',
    'dominio3.com.br'
  ];

  const productTypes = [
    'Infoproduto',
    'Curso Online',
    'E-book',
    'Mentoria',
    'Software',
    'Serviço'
  ];

  const niches = [
    'Saúde',
    'Relacionamento',
    'Dinheiro',
    'Educação',
    'Espiritualidade',
    'Desenvolvimento Pessoal'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    // Navegar de volta para page-builder
    router.push('/page-builder');
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.push('/page-builder')}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-headline">Criar Nova Review</h1>
            <p className="text-label text-muted-foreground">Configure os detalhes da sua página de review</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Domínio */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Domínio <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Escolha o domínio</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Nome da página */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Nome da página <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pageName}
                  onChange={(e) => setFormData({...formData, pageName: e.target.value})}
                  placeholder="Informe o nome da sua página"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Nome do produto */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Nome do produto <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder="Informe o nome do produto"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Link de Afiliado */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Link de Afiliado <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(e) => setFormData({...formData, affiliateLink: e.target.value})}
                  placeholder="Informe o link de afiliado"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Página de vendas do produtor */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Página de vendas do produtor <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={(e) => setFormData({...formData, producerSalesPage: e.target.value})}
                  placeholder="Informe a página de vendas"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Tipo de produto */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Tipo de produto <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.productType}
                    onChange={(e) => setFormData({...formData, productType: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Escolha a categoria</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Nicho */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Nicho <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.niche}
                    onChange={(e) => setFormData({...formData, niche: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Escolha o Nicho</option>
                    {niches.map((niche) => (
                      <option key={niche} value={niche}>{niche}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Confirmação IA */}
            <div className="mt-6 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer pt-10">
                <input 
                  type="checkbox"
                  checked={isAwareOfAI}
                  onChange={(e) => setIsAwareOfAI(e.target.checked)}
                  className="mt-1 w-4 h-4 border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-body text-muted-foreground">
                  Estou ciente de que o conteúdo é gerado por inteligência artificial e que devo revisá-lo antes de anunciar
                </span>
              </label>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-border bg-background hover:bg-accent text-foreground rounded-md transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={!isAwareOfAI}
                className={`px-8 py-3 rounded-md transition-colors font-medium ${
                  isAwareOfAI
                    ? 'bg-white hover:bg-white/90 text-black'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                }`}
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}