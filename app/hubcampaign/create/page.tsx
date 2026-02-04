'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { RefreshCcw01 as RefreshCcw, Star01 as Star } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';
import { TooltipHelp } from '../../components/ui/tooltip-help';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import type { Key } from 'react-aria-components';

interface GoogleAccount {
  id: number;
  email: string;
}

interface GoogleAdsAccount {
  customerId: string;
  accountName: string;
  isManager: boolean;
  isTestAccount: boolean;
  mccId?: string;
}

interface MccSubaccount {
  customerId: string;
  accountName: string;
  isTestAccount: boolean;
}

interface HubTitleProduct {
  id: number;
  name: string;
  description: string;
  links: string | null;
  category: string | null;
  titles: { id: number; content: string; isFavorite: boolean }[];
  descriptions: { id: number; content: string; isFavorite: boolean }[];
}

const COUNTRIES = [
  { id: 'BR', label: 'Brasil' },
  { id: 'US', label: 'Estados Unidos' },
  { id: 'PT', label: 'Portugal' },
  { id: 'ES', label: 'Espanha' },
  { id: 'MX', label: 'México' },
  { id: 'AR', label: 'Argentina' },
  { id: 'CO', label: 'Colômbia' },
  { id: 'CL', label: 'Chile' },
];

const LANGUAGES = [
  { id: 'pt', label: 'Português' },
  { id: 'en', label: 'Inglês' },
  { id: 'es', label: 'Espanhol' },
];

export default function CreateCampaign() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    // Google Ads
    selectedGmail: '',
    selectedMcc: '',
    selectedSubaccount: '',
    // Produto (para criar novo)
    productName: '',
    productDescription: '',
    productUrl: '',
    // Campanha
    campaignName: '',
    dailyBudget: '',
    country: 'BR',
    language: 'pt',
  });

  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGmails, setIsLoadingGmails] = useState(false);
  const [isLoadingMccs, setIsLoadingMccs] = useState(false);
  const [isLoadingSubaccounts, setIsLoadingSubaccounts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Dados
  const [gmailAccounts, setGmailAccounts] = useState<GoogleAccount[]>([]);
  const [mccAccounts, setMccAccounts] = useState<GoogleAdsAccount[]>([]);
  const [subaccounts, setSubaccounts] = useState<MccSubaccount[]>([]);

  // Produtos
  const [products, setProducts] = useState<HubTitleProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<HubTitleProduct | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Seleção de títulos e descrições
  const [selectedTitleIds, setSelectedTitleIds] = useState<Set<number>>(new Set());
  const [selectedDescriptionIds, setSelectedDescriptionIds] = useState<Set<number>>(new Set());

  // Buscar contas Gmail e produtos ao montar
  useEffect(() => {
    const fetchGmails = async () => {
      setIsLoadingGmails(true);
      try {
        const response = await fetch('/api/settings/gmails');
        if (!response.ok) throw new Error('Failed to fetch gmails');
        const data = await response.json();
        if (data.success && data.data) {
          setGmailAccounts(data.data);
        }
      } catch (error) {
        console.error('Error fetching gmails:', error);
      } finally {
        setIsLoadingGmails(false);
      }
    };

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch('/api/hubtitle/products');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchGmails();
    fetchProducts();
  }, []);

  // Buscar MCCs quando Gmail for selecionado
  const fetchMccAccounts = async (googleAccountId: string) => {
    if (!googleAccountId) {
      setMccAccounts([]);
      return;
    }

    setIsLoadingMccs(true);
    try {
      const response = await fetch(`/api/google-ads/list-accounts?googleAccountId=${googleAccountId}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const mccs = data.data.filter((acc: GoogleAdsAccount) => acc.isManager && !acc.isTestAccount);
        setMccAccounts(mccs);
      } else {
        setMccAccounts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar MCCs:', error);
      setMccAccounts([]);
    } finally {
      setIsLoadingMccs(false);
    }
  };

  // Buscar subcontas quando MCC for selecionada
  const fetchSubaccounts = async (googleAccountId: string, mccId: string) => {
    if (!googleAccountId || !mccId) {
      setSubaccounts([]);
      return;
    }

    setIsLoadingSubaccounts(true);
    try {
      const response = await fetch(`/api/google-ads/list-accounts?googleAccountId=${googleAccountId}&mccId=${mccId}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const subs = data.data.filter((acc: GoogleAdsAccount) => !acc.isManager && !acc.isTestAccount);
        setSubaccounts(subs);
      } else {
        setSubaccounts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar subcontas:', error);
      setSubaccounts([]);
    } finally {
      setIsLoadingSubaccounts(false);
    }
  };

  // Handlers
  const handleGmailSelect = (gmailId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGmail: gmailId,
      selectedMcc: '',
      selectedSubaccount: '',
    }));
    setMccAccounts([]);
    setSubaccounts([]);
    if (gmailId) {
      fetchMccAccounts(gmailId);
    }
  };

  const handleMccSelect = (mccId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMcc: mccId,
      selectedSubaccount: '',
    }));
    setSubaccounts([]);
    if (mccId && formData.selectedGmail) {
      fetchSubaccounts(formData.selectedGmail, mccId);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Selecionar produto existente
  const handleSelectProduct = (product: HubTitleProduct) => {
    setSelectedProduct(product);
    setIsCreatingNew(false);

    setFormData(prev => ({
      ...prev,
      productName: product.name,
      productDescription: product.description,
      productUrl: product.links || prev.productUrl,
    }));

    // Pré-selecionar favoritos
    const favoriteTitles = product.titles.filter(t => t.isFavorite).slice(0, 5);
    const favoriteDescs = product.descriptions.filter(d => d.isFavorite).slice(0, 2);

    const titlesToSelect = favoriteTitles.length >= 3
      ? favoriteTitles
      : product.titles.slice(0, 3);
    const descsToSelect = favoriteDescs.length >= 2
      ? favoriteDescs
      : product.descriptions.slice(0, 2);

    setSelectedTitleIds(new Set(titlesToSelect.map(t => t.id)));
    setSelectedDescriptionIds(new Set(descsToSelect.map(d => d.id)));
  };

  // Iniciar criação de novo produto
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedProduct(null);
    setSelectedTitleIds(new Set());
    setSelectedDescriptionIds(new Set());
    setFormData(prev => ({
      ...prev,
      productName: '',
      productDescription: '',
      productUrl: '',
    }));
  };

  // Gerar títulos e descrições (cria produto no banco)
  const handleGenerateContent = async () => {
    if (!formData.productName || !formData.productDescription) {
      showError('Preencha o nome e descrição do produto');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/hubcampaign/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName,
          productDescription: formData.productDescription,
          productUrl: formData.productUrl,
          language: formData.language,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Adicionar produto à lista e selecioná-lo
        const newProduct = data.data.product;
        setProducts(prev => [newProduct, ...prev]);
        setSelectedProduct(newProduct);
        setIsCreatingNew(false);

        // Pré-selecionar todos os títulos e descrições gerados
        setSelectedTitleIds(new Set(newProduct.titles.slice(0, 5).map((t: { id: number }) => t.id)));
        setSelectedDescriptionIds(new Set(newProduct.descriptions.slice(0, 2).map((d: { id: number }) => d.id)));

        showSuccess('Produto criado com sucesso!');
      } else {
        showError(data.error || 'Erro ao gerar conteúdo');
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      showError('Erro ao gerar conteúdo');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle título
  const handleToggleTitle = (titleId: number) => {
    setSelectedTitleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(titleId)) {
        newSet.delete(titleId);
      } else if (newSet.size < 5) {
        newSet.add(titleId);
      }
      return newSet;
    });
  };

  // Toggle descrição
  const handleToggleDescription = (descId: number) => {
    setSelectedDescriptionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(descId)) {
        newSet.delete(descId);
      } else if (newSet.size < 2) {
        newSet.add(descId);
      }
      return newSet;
    });
  };

  // Criar campanha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      showError('Selecione ou crie um produto');
      return;
    }

    const selectedTitles = selectedProduct.titles
      .filter(t => selectedTitleIds.has(t.id))
      .map(t => t.content);
    const selectedDescriptions = selectedProduct.descriptions
      .filter(d => selectedDescriptionIds.has(d.id))
      .map(d => d.content);

    if (selectedTitles.length < 3 || selectedTitles.length > 5) {
      showError('Selecione de 3 a 5 títulos');
      return;
    }

    if (selectedDescriptions.length !== 2) {
      showError('Selecione exatamente 2 descrições');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/hubcampaign/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleAccountId: formData.selectedGmail,
          mccId: formData.selectedMcc,
          customerId: formData.selectedSubaccount,
          campaignName: formData.campaignName || formData.productName,
          dailyBudget: parseFloat(formData.dailyBudget),
          country: formData.country,
          language: formData.language,
          finalUrl: formData.productUrl || selectedProduct.links,
          titles: selectedTitles,
          descriptions: selectedDescriptions,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess('Campanha criada com sucesso!');
        router.push('/hubcampaign');
      } else {
        showError(data.error || 'Erro ao criar campanha');
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      showError('Erro ao criar campanha');
    } finally {
      setIsLoading(false);
    }
  };

  // Validações
  const canGenerate = formData.productName && formData.productDescription;
  const hasValidContent = selectedProduct && selectedTitleIds.size >= 3 && selectedTitleIds.size <= 5 && selectedDescriptionIds.size === 2;
  const canSubmit = formData.selectedGmail &&
    formData.selectedMcc &&
    formData.selectedSubaccount &&
    (formData.productUrl || selectedProduct?.links) &&
    formData.dailyBudget &&
    hasValidContent;

  return (
    <div className="min-h-screen p-6 md:p-8">
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
            <h1 className="text-headline">Criar Campanha</h1>
            <p className="text-label text-muted-foreground">
              Configure sua campanha Google Ads de forma simples
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Seção: Conta Google */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-title mb-6">Conta Google Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gmail */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Conta Google <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione a conta Google conectada que possui acesso ao Google Ads." />
                </span>
                <Select
                  placeholder={isLoadingGmails ? 'Carregando...' : 'Escolha o email'}
                  selectedKey={formData.selectedGmail || null}
                  onSelectionChange={(key: Key | null) => handleGmailSelect(key as string || '')}
                  items={gmailAccounts.map((account) => ({ id: account.id.toString(), label: account.email }))}
                  isRequired
                  isDisabled={isLoadingGmails}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {gmailAccounts.length === 0 && !isLoadingGmails && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma conta conectada.{' '}
                    <a href="/settings/accounts" className="text-primary hover:underline">
                      Conectar
                    </a>
                  </p>
                )}
              </div>

              {/* MCC */}
              <div className="space-y-1">
                <span className={`text-body font-medium flex items-center gap-2 ${!formData.selectedGmail ? 'text-muted-foreground' : ''}`}>
                  MCC <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione a MCC (conta gerenciadora) que contém a subconta." />
                </span>
                <Select
                  placeholder={isLoadingMccs ? 'Carregando...' : 'Selecione a MCC'}
                  selectedKey={formData.selectedMcc || null}
                  onSelectionChange={(key: Key | null) => handleMccSelect(key as string || '')}
                  items={mccAccounts.map((account) => ({
                    id: account.customerId,
                    label: account.accountName.includes(account.customerId)
                      ? account.accountName
                      : `${account.accountName} - ${account.customerId}`
                  }))}
                  isRequired
                  isDisabled={!formData.selectedGmail || isLoadingMccs}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {formData.selectedGmail && !isLoadingMccs && mccAccounts.length === 0 && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma MCC encontrada
                  </p>
                )}
              </div>

              {/* Subconta */}
              <div className="space-y-1">
                <span className={`text-body font-medium flex items-center gap-2 ${!formData.selectedMcc ? 'text-muted-foreground' : ''}`}>
                  Conta Google Ads <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione a conta Google Ads onde a campanha será criada." />
                </span>
                <Select
                  placeholder={isLoadingSubaccounts ? 'Carregando...' : 'Selecione a conta'}
                  selectedKey={formData.selectedSubaccount || null}
                  onSelectionChange={(key: Key | null) => handleInputChange('selectedSubaccount', key as string || '')}
                  items={subaccounts.map((account) => ({
                    id: account.customerId,
                    label: account.accountName.includes(account.customerId)
                      ? account.accountName
                      : `${account.accountName} - ${account.customerId}`
                  }))}
                  isRequired
                  isDisabled={!formData.selectedMcc || isLoadingSubaccounts}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {formData.selectedMcc && !isLoadingSubaccounts && subaccounts.length === 0 && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma subconta encontrada
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Produto */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-title mb-6">Produto</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Produtos */}
              <div className="lg:col-span-1">
                <div className="bg-background border border-border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-body font-medium">Meus Produtos</h3>
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className={`p-1.5 rounded-md transition-colors ${isCreatingNew ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                      title="Criar novo produto"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {isLoadingProducts ? (
                    <p className="text-label text-muted-foreground text-center py-4">Carregando...</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`w-full text-left p-3 rounded-md border transition-colors cursor-pointer ${
                            selectedProduct?.id === product.id && !isCreatingNew
                              ? 'bg-accent border-primary'
                              : 'bg-card border-border hover:bg-accent'
                          }`}
                        >
                          <p className="text-body font-medium truncate">{product.name}</p>
                          <p className="text-label text-muted-foreground mt-1">
                            {product.titles.length} títulos • {product.descriptions.length} descrições
                          </p>
                          {(product.titles.filter(t => t.isFavorite).length + product.descriptions.filter(d => d.isFavorite).length) > 0 && (
                            <p className="text-label text-muted-foreground flex items-center gap-1 mt-1">
                              <Star className="text-yellow-400 size-3" />
                              {product.titles.filter(t => t.isFavorite).length + product.descriptions.filter(d => d.isFavorite).length} favoritos
                            </p>
                          )}
                        </div>
                      ))}
                      {products.length === 0 && (
                        <p className="text-label text-muted-foreground text-center py-4">
                          Nenhum produto ainda
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Área direita - Formulário ou Seleção */}
              <div className="lg:col-span-2">
                {isCreatingNew ? (
                  /* Formulário de novo produto */
                  <div className="bg-background border border-border rounded-md p-4 space-y-4">
                    <h3 className="text-body font-medium">Novo Produto</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-label font-medium">
                          Nome do Produto <span className="text-destructive">*</span>
                        </span>
                        <Input
                          placeholder="Ex: Curso de Marketing Digital"
                          value={formData.productName}
                          onChange={(value) => handleInputChange('productName', value)}
                          isRequired
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-label font-medium">
                          URL da Página
                        </span>
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={formData.productUrl}
                          onChange={(value) => handleInputChange('productUrl', value)}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <span className="text-label font-medium">
                          Descrição do Produto <span className="text-destructive">*</span>
                        </span>
                        <textarea
                          value={formData.productDescription}
                          onChange={(e) => handleInputChange('productDescription', e.target.value)}
                          placeholder="Descreva seu produto em detalhes..."
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[80px] resize-none shadow-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-label font-medium">Idioma</span>
                        <Select
                          placeholder="Selecione"
                          selectedKey={formData.language}
                          onSelectionChange={(key: Key | null) => handleInputChange('language', key as string || 'pt')}
                          items={LANGUAGES}
                        >
                          {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          color="primary"
                          size="md"
                          iconLeading={RefreshCcw}
                          onClick={handleGenerateContent}
                          isDisabled={!canGenerate || isGenerating}
                          isLoading={isGenerating}
                        >
                          Gerar Títulos e Descrições
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : selectedProduct ? (
                  /* Seleção de títulos e descrições */
                  <div className="space-y-4">
                    {/* Info do Produto */}
                    <div className="bg-background border border-border rounded-md p-4">
                      <h3 className="text-body font-medium mb-1">{selectedProduct.name}</h3>
                      <p className="text-label text-muted-foreground">{selectedProduct.description}</p>
                    </div>

                    {/* URL - precisa preencher se não tiver */}
                    {!selectedProduct.links && (
                      <div className="space-y-1">
                        <span className="text-body font-medium flex items-center gap-2">
                          URL da Página <span className="text-destructive">*</span>
                          <TooltipHelp text="Este produto não tem URL. Preencha o link da página de destino." />
                        </span>
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={formData.productUrl}
                          onChange={(value) => handleInputChange('productUrl', value)}
                          isRequired
                        />
                      </div>
                    )}

                    {/* Info de requisitos */}
                    <div className="p-3 bg-accent/30 rounded-md border border-border text-label text-muted-foreground">
                      Selecione de <span className="font-medium text-foreground">3 a 5 títulos</span> e <span className="font-medium text-foreground">2 descrições</span> para a campanha.
                    </div>

                    {/* Títulos e Descrições */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Títulos */}
                      <div className="bg-background border border-border rounded-md p-4">
                        <h4 className="text-label text-muted-foreground mb-3">
                          Títulos ({selectedTitleIds.size}/5)
                          {selectedTitleIds.size < 3 && <span className="text-destructive ml-1">- mín. 3</span>}
                        </h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedProduct.titles
                            .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                            .map((title) => {
                              const isSelected = selectedTitleIds.has(title.id);
                              const canSelect = isSelected || selectedTitleIds.size < 5;
                              return (
                                <div
                                  key={title.id}
                                  onClick={() => canSelect && handleToggleTitle(title.id)}
                                  className={`p-2 rounded-md text-body text-sm transition-colors ${
                                    canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                  } ${
                                    isSelected
                                      ? 'bg-primary/10 border-2 border-primary'
                                      : title.isFavorite
                                      ? 'bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20'
                                      : 'bg-accent/50 border border-transparent hover:bg-accent'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      disabled={!canSelect}
                                      className="mt-0.5 accent-primary"
                                    />
                                    {title.isFavorite && <Star className="text-yellow-400 size-3 mt-0.5 flex-shrink-0" />}
                                    <span className="flex-1">{title.content}</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Descrições */}
                      <div className="bg-background border border-border rounded-md p-4">
                        <h4 className="text-label text-muted-foreground mb-3">
                          Descrições ({selectedDescriptionIds.size}/2)
                          {selectedDescriptionIds.size < 2 && <span className="text-destructive ml-1">- selecione 2</span>}
                        </h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedProduct.descriptions
                            .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                            .map((desc) => {
                              const isSelected = selectedDescriptionIds.has(desc.id);
                              const canSelect = isSelected || selectedDescriptionIds.size < 2;
                              return (
                                <div
                                  key={desc.id}
                                  onClick={() => canSelect && handleToggleDescription(desc.id)}
                                  className={`p-2 rounded-md text-body text-sm transition-colors ${
                                    canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                  } ${
                                    isSelected
                                      ? 'bg-primary/10 border-2 border-primary'
                                      : desc.isFavorite
                                      ? 'bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400/20'
                                      : 'bg-accent/50 border border-transparent hover:bg-accent'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      disabled={!canSelect}
                                      className="mt-0.5 accent-primary"
                                    />
                                    {desc.isFavorite && <Star className="text-yellow-400 size-3 mt-0.5 flex-shrink-0" />}
                                    <span className="flex-1">{desc.content}</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Nenhum produto selecionado */
                  <div className="bg-background border border-border rounded-md p-8 text-center h-full flex items-center justify-center min-h-[300px]">
                    <div>
                      <p className="text-body text-muted-foreground mb-4">
                        Selecione um produto existente ou crie um novo
                      </p>
                      <Button
                        type="button"
                        color="primary"
                        size="md"
                        iconLeading={Plus}
                        onClick={handleCreateNew}
                      >
                        Criar Novo Produto
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Configuração da Campanha */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-title mb-6">Configuração da Campanha</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Campanha */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nome da Campanha
                  <TooltipHelp text="Nome para identificar a campanha no Google Ads. Se vazio, usa o nome do produto." />
                </span>
                <Input
                  placeholder={formData.productName || 'Nome do produto'}
                  value={formData.campaignName}
                  onChange={(value) => handleInputChange('campaignName', value)}
                />
              </div>

              {/* Orçamento Diário */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Orçamento Diário (R$) <span className="text-destructive">*</span>
                  <TooltipHelp text="Quanto você quer gastar por dia nesta campanha." />
                </span>
                <Input
                  type="number"
                  placeholder="Ex: 50"
                  value={formData.dailyBudget}
                  onChange={(value) => handleInputChange('dailyBudget', value)}
                  isRequired
                />
              </div>

              {/* País */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  País de Segmentação <span className="text-destructive">*</span>
                  <TooltipHelp text="País onde os anúncios serão exibidos." />
                </span>
                <Select
                  placeholder="Selecione o país"
                  selectedKey={formData.country}
                  onSelectionChange={(key: Key | null) => handleInputChange('country', key as string || 'BR')}
                  items={COUNTRIES}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              color="secondary"
              size="lg"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              color="primary"
              size="lg"
              isDisabled={!canSubmit || isLoading}
              isLoading={isLoading}
            >
              Criar Campanha
            </Button>
          </div>
        </form>
      </div>

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
