'use client';

import { useState } from 'react';
import { ChevronDown, ArrowLeft, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatePresell() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    domain: '',
    pageName: '',
    affiliateLink: '',
    producerSalesPage: '',
    presellType: '',
    presellLanguage: ''
  });

  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Mock data
  const domains = [
    'lojaonlineproducts.site',
    'theofficialportal.store',
    'onlydiscount.site'
  ];

  const presellTypes = [
    'VSL (Video Sales Letter)',
    'Carta de Vendas',
    'Landing Page',
    'Página de Captura'
  ];

  const languages = [
    'Português',
    'Inglês',
    'Espanhol'
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
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-headline">Criar Nova Presell</h1>
            <p className="text-label text-muted-foreground">
              Configure os detalhes da sua página de pré-venda
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
                    required
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
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
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
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
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
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Tipo de Presell */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Tipo de Presell <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.presellType}
                    onChange={(e) => setFormData({...formData, presellType: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {presellTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Idioma da Presell */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Idioma <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.presellLanguage}
                    onChange={(e) => setFormData({...formData, presellLanguage: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione o idioma</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Configurações avançadas */}
            <div className="pt-8">
              <button
                type="button"
                onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                className="flex items-center gap-3 text-body font-medium hover:text-foreground transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Configurações avançadas</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedConfig ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedConfig && (
                <div className="mt-6 p-6 bg-accent/30 rounded-lg border border-border">
                  <div className="space-y-6">
                    {/* Ativar Cloaker */}
                    <div className="space-y-3">
                      <label className="text-body font-medium">
                        Ativar Cloaker?
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-600"></div>
                      </label>
                    </div>

                    {/* Script do cabeçalho head */}
                    <div className="space-y-3">
                      <label className="text-body font-medium">
                        Informe o script do cabeçalho "head" (opcional)
                      </label>
                      <textarea
                        placeholder="Informe o script do cabeçalho (opcional)"
                        className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-32"
                      />
                    </div>

                    {/* Script do cabeçalho body */}
                    <div className="space-y-3">
                      <label className="text-body font-medium">
                        Informe o script do cabeçalho "body" (opcional)
                      </label>
                      <textarea
                        placeholder="Informe o script do corpo (opcional)"
                        className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-32"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-border bg-background hover:bg-accent text-foreground rounded-md transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-8 py-3 rounded-md transition-colors font-medium bg-white hover:bg-white/90 text-black"
              >
                Criar Presell
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}