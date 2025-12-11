'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, Trash } from 'lucide-react';
import type { CampaignData, Keyword, AdTitle, AdDescription, Sitelink, PriceExtension, Promotion } from '../../types/campaign';

interface CampaignConfigStepProps {
  data: CampaignData;
  onChange: (data: CampaignData) => void;
  onSave: () => void;
  onBack: () => void;
}

export function CampaignConfigStep({ data, onChange, onSave, onBack }: CampaignConfigStepProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    filtering: data.isFilteringEnabled,
    bidStrategy: false,
    keywords: false,
    titles: false,
    descriptions: false,
    headlines: false,
    sitelinks: false,
    priceExtensions: false,
    promotions: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleConfigChange = (field: string, value: any) => {
    onChange({
      ...data,
      campaignConfig: {
        ...data.campaignConfig,
        [field]: value,
      },
    });
  };

  const handleFilteringToggle = (enabled: boolean) => {
    onChange({ ...data, isFilteringEnabled: enabled });
    setExpandedSections((prev) => ({ ...prev, filtering: enabled }));
  };

  const addKeyword = () => {
    onChange({
      ...data,
      campaignAssets: {
        ...data.campaignAssets,
        keywords: [...data.campaignAssets.keywords, { text: '', matchType: 'frase' }],
      },
    });
  };

  const removeKeyword = (index: number) => {
    const keywords = [...data.campaignAssets.keywords];
    keywords.splice(index, 1);
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, keywords },
    });
  };

  const updateKeyword = (index: number, field: keyof Keyword, value: any) => {
    const keywords = [...data.campaignAssets.keywords];
    keywords[index] = { ...keywords[index], [field]: value };
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, keywords },
    });
  };

  const addTitle = () => {
    onChange({
      ...data,
      campaignAssets: {
        ...data.campaignAssets,
        titles: [...data.campaignAssets.titles, { text: '' }],
      },
    });
  };

  const removeTitle = (index: number) => {
    const titles = [...data.campaignAssets.titles];
    titles.splice(index, 1);
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, titles },
    });
  };

  const updateTitle = (index: number, text: string) => {
    const titles = [...data.campaignAssets.titles];
    titles[index] = { text };
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, titles },
    });
  };

  const addDescription = () => {
    onChange({
      ...data,
      campaignAssets: {
        ...data.campaignAssets,
        descriptions: [...data.campaignAssets.descriptions, { text: '' }],
      },
    });
  };

  const removeDescription = (index: number) => {
    const descriptions = [...data.campaignAssets.descriptions];
    descriptions.splice(index, 1);
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, descriptions },
    });
  };

  const updateDescription = (index: number, text: string) => {
    const descriptions = [...data.campaignAssets.descriptions];
    descriptions[index] = { text };
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, descriptions },
    });
  };

  const addSitelink = () => {
    onChange({
      ...data,
      campaignAssets: {
        ...data.campaignAssets,
        sitelinks: [
          ...data.campaignAssets.sitelinks,
          { title: '', description1: '', description2: '', url: '' },
        ],
      },
    });
  };

  const removeSitelink = (index: number) => {
    const sitelinks = [...data.campaignAssets.sitelinks];
    sitelinks.splice(index, 1);
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, sitelinks },
    });
  };

  const updateSitelink = (index: number, field: keyof Sitelink, value: string) => {
    const sitelinks = [...data.campaignAssets.sitelinks];
    sitelinks[index] = { ...sitelinks[index], [field]: value };
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, sitelinks },
    });
  };

  const addPriceExtension = () => {
    onChange({
      ...data,
      campaignAssets: {
        ...data.campaignAssets,
        priceExtensions: [
          ...data.campaignAssets.priceExtensions,
          { title: '', description: '', price: 0 },
        ],
      },
    });
  };

  const removePriceExtension = (index: number) => {
    const priceExtensions = [...data.campaignAssets.priceExtensions];
    priceExtensions.splice(index, 1);
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, priceExtensions },
    });
  };

  const updatePriceExtension = (index: number, field: keyof PriceExtension, value: any) => {
    const priceExtensions = [...data.campaignAssets.priceExtensions];
    priceExtensions[index] = { ...priceExtensions[index], [field]: value };
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, priceExtensions },
    });
  };

  const addPromotion = () => {
    onChange({
      ...data,
      campaignAssets: {
        ...data.campaignAssets,
        promotions: [...data.campaignAssets.promotions, { text: '', type: 'percentual' }],
      },
    });
  };

  const removePromotion = (index: number) => {
    const promotions = [...data.campaignAssets.promotions];
    promotions.splice(index, 1);
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, promotions },
    });
  };

  const updatePromotion = (index: number, field: keyof Promotion, value: any) => {
    const promotions = [...data.campaignAssets.promotions];
    promotions[index] = { ...promotions[index], [field]: value };
    onChange({
      ...data,
      campaignAssets: { ...data.campaignAssets, promotions },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Nome da sua campanha
        </label>
        <input
          type="text"
          value={data.campaignConfig.name}
          onChange={(e) => handleConfigChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          placeholder="Teste Produtive - RP - 0 - 1/12/2025"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Qual estratégia você vai usar?
        </label>
        <select
          value={data.campaignConfig.strategy}
          onChange={(e) => handleConfigChange('strategy', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
        >
          <option value="maximizar-cliques">Maximizar Cliques</option>
          <option value="maximizar-conversoes">Maximizar Conversões</option>
          <option value="cpa-alvo">CPA Alvo</option>
          <option value="roas-alvo">ROAS Alvo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Aonde você vai fazer a campanha?
        </label>
        <select
          value={data.campaignConfig.country}
          onChange={(e) => handleConfigChange('country', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
        >
          <option value="Brasil">Brasil</option>
          <option value="Estados Unidos">Estados Unidos</option>
          <option value="Portugal">Portugal</option>
        </select>
      </div>

      {/* Filtering Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.isFilteringEnabled}
              onChange={(e) => handleFilteringToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-900">
            Minha página está na Filtripage
          </span>
        </div>

        {data.isFilteringEnabled && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domínio da Filtripage
              </label>
              <select
                value={data.filterDomain || ''}
                onChange={(e) => onChange({ ...data, filterDomain: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Selecione</option>
                <option value="google (theofficialportal.store)">
                  google (theofficialportal.store)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento 1 do seu link
                </label>
                <input
                  type="text"
                  value={data.urlComplement1 || ''}
                  onChange={(e) => onChange({ ...data, urlComplement1: e.target.value })}
                  maxLength={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50"
                  placeholder="best"
                />
                <span className="text-xs text-gray-500">4/15</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento 2 do seu link
                </label>
                <input
                  type="text"
                  value={data.urlComplement2 || ''}
                  onChange={(e) => onChange({ ...data, urlComplement2: e.target.value })}
                  maxLength={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50"
                  placeholder="offer"
                />
                <span className="text-xs text-gray-500">5/15</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {/* Estratégias de lances */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('bidStrategy')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Estratégias de lances</span>
            {expandedSections.bidStrategy ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.bidStrategy && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estratégia de lance atual</h4>
                <p className="text-sm text-gray-600 mb-3">Maximizar Cliques</p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estratégia de lances disponíveis
                </label>
                <select
                  value={data.campaignAssets.bidStrategy}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      campaignAssets: { ...data.campaignAssets, bidStrategy: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                >
                  <option value="maximizar-cliques">Maximizar Cliques</option>
                  <option value="maximizar-conversoes">Maximizar Conversões</option>
                  <option value="cpa-alvo">CPA Alvo</option>
                  <option value="roas-alvo">ROAS Alvo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPC máximo (R$)
                  </label>
                  <input
                    type="number"
                    value={data.campaignConfig.maxCPC || ''}
                    onChange={(e) => handleConfigChange('maxCPC', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento máximo diário (R$)
                  </label>
                  <input
                    type="number"
                    value={data.campaignConfig.maxDailyBudget || ''}
                    onChange={(e) => handleConfigChange('maxDailyBudget', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Palavras chave */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('keywords')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Palavras chave</span>
            {expandedSections.keywords ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.keywords && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-3">
                {data.campaignAssets.keywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={keyword.text}
                      onChange={(e) => updateKeyword(index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Palavra-chave"
                    />
                    <select
                      value={keyword.matchType}
                      onChange={(e) => updateKeyword(index, 'matchType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="exata">Exata</option>
                      <option value="frase">Frase</option>
                      <option value="ampla">Ampla</option>
                    </select>
                    <button
                      onClick={() => removeKeyword(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addKeyword}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" /> Adicionar palavra-chave
              </button>
            </div>
          )}
        </div>

        {/* Títulos */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('titles')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Títulos</span>
            {expandedSections.titles ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.titles && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-3">
                {data.campaignAssets.titles.map((title, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Título {index + 1}</label>
                      <button
                        onClick={() => removeTitle(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={title.text}
                      onChange={(e) => updateTitle(index, e.target.value)}
                      maxLength={30}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                      placeholder="Título do anúncio"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{title.text.length}/30</span>
                      <button className="text-green-600 hover:text-green-700">Ver tradução</button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addTitle}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" /> Adicionar título
              </button>
            </div>
          )}
        </div>

        {/* Descrições */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('descriptions')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Descrições</span>
            {expandedSections.descriptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.descriptions && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-3">
                {data.campaignAssets.descriptions.map((description, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Título {index + 1}</label>
                      <button
                        onClick={() => removeDescription(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <textarea
                      value={description.text}
                      onChange={(e) => updateDescription(index, e.target.value)}
                      maxLength={90}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                      placeholder="Descrição do anúncio"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{description.text.length}/90</span>
                      <button className="text-green-600 hover:text-green-700">Ver tradução</button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addDescription}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" /> Adicionar descrição
              </button>
            </div>
          )}
        </div>

        {/* Frases de destaque */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('headlines')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Frases de destaque</span>
            {expandedSections.headlines ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Sitelinks */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('sitelinks')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Sitelinks</span>
            {expandedSections.sitelinks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.sitelinks && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-4">
                {data.campaignAssets.sitelinks.map((sitelink, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Sitelink {index + 1}</h5>
                      <button
                        onClick={() => removeSitelink(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Título do Sitelink {index + 1}</label>
                      <input
                        type="text"
                        value={sitelink.title}
                        onChange={(e) => updateSitelink(index, 'title', e.target.value)}
                        maxLength={25}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                      />
                      <span className="text-xs text-gray-500">{sitelink.title.length}/25</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Descrição 1 do Sitelink {index + 1}</label>
                      <textarea
                        value={sitelink.description1}
                        onChange={(e) => updateSitelink(index, 'description1', e.target.value)}
                        maxLength={35}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                      />
                      <span className="text-xs text-gray-500">{sitelink.description1.length}/35</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Descrição 2 do Sitelink {index + 1}</label>
                      <textarea
                        value={sitelink.description2}
                        onChange={(e) => updateSitelink(index, 'description2', e.target.value)}
                        maxLength={35}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                      />
                      <span className="text-xs text-gray-500">{sitelink.description2.length}/35</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addSitelink}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" /> Adicionar sitelink
              </button>
            </div>
          )}
        </div>

        {/* Extensão de preço */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('priceExtensions')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Extensão de preço</span>
            {expandedSections.priceExtensions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.priceExtensions && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-4">
                {data.campaignAssets.priceExtensions.map((priceExt, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Título de preço {index + 1}</h5>
                      <button
                        onClick={() => removePriceExtension(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={priceExt.title}
                      onChange={(e) => updatePriceExtension(index, 'title', e.target.value)}
                      maxLength={25}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                      placeholder="Título"
                    />
                    <input
                      type="text"
                      value={priceExt.description}
                      onChange={(e) => updatePriceExtension(index, 'description', e.target.value)}
                      maxLength={25}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                      placeholder="Descrição"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addPriceExtension}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg"
              >
                <Plus /> Adicionar extensão de preço
              </button>
            </div>
          )}
        </div>

        {/* Promoções */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('promotions')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-semibold text-gray-900">Promoções</span>
            {expandedSections.promotions ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.promotions && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2">Promoção por percentual</h5>
                  <input
                    type="text"
                    value={data.campaignAssets.promotions.find((p) => p.type === 'percentual')?.text || ''}
                    onChange={(e) => {
                      const existingIndex = data.campaignAssets.promotions.findIndex((p) => p.type === 'percentual');
                      if (existingIndex >= 0) {
                        updatePromotion(existingIndex, 'text', e.target.value);
                      } else {
                        addPromotion();
                        updatePromotion(data.campaignAssets.promotions.length, 'text', e.target.value);
                      }
                    }}
                    maxLength={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                    placeholder="80% Teste Produtive"
                  />
                  <span className="text-xs text-gray-500">19/20</span>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Promoção por valor</h5>
                  <input
                    type="text"
                    value={data.campaignAssets.promotions.find((p) => p.type === 'valor')?.text || ''}
                    onChange={(e) => {
                      const existingIndex = data.campaignAssets.promotions.findIndex((p) => p.type === 'valor');
                      if (existingIndex >= 0) {
                        updatePromotion(existingIndex, 'text', e.target.value);
                      } else {
                        addPromotion();
                        const newIndex = data.campaignAssets.promotions.length;
                        updatePromotion(newIndex, 'type', 'valor');
                        updatePromotion(newIndex, 'text', e.target.value);
                      }
                    }}
                    maxLength={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50"
                    placeholder="$234 Teste Produtive"
                  />
                  <span className="text-xs text-gray-500">20/20</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onSave}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
