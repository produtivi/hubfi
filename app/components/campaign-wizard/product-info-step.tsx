'use client';

import { useState } from 'react';
import type { ProductInfo } from '../../types/campaign';

interface ProductInfoStepProps {
  data: ProductInfo;
  onChange: (data: ProductInfo) => void;
  onNext: () => void;
}

export function ProductInfoStep({ data, onChange, onNext }: ProductInfoStepProps) {
  const [localData, setLocalData] = useState<ProductInfo>(data);

  const handleChange = (field: keyof ProductInfo, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  const handleOfferChange = (
    offerType: 'simple' | 'medium' | 'best',
    field: string,
    value: number
  ) => {
    const updated = {
      ...localData,
      offers: {
        ...localData.offers,
        [offerType]: {
          ...(localData.offers[offerType] || { fullPrice: 0, discountPrice: 0, quantity: 1, treatmentDays: 30 }),
          [field]: value,
        },
      },
    };
    setLocalData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-900 mb-1">
          Nome do produto <span className="text-gray-500">(máx. 12)</span>
        </label>
        <input
          type="text"
          value={localData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Teste"
          maxLength={12}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Tipo</label>
          <select
            value={localData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            <option value="fisico">Físico</option>
            <option value="digital">Digital</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Nicho</label>
          <select
            value={localData.niche}
            onChange={(e) => handleChange('niche', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            <option value="dental">Dental</option>
            <option value="saude">Saúde</option>
            <option value="relacionamento">Relacionamento</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="espiritualidade">Espiritualidade</option>
            <option value="educacao">Educação</option>
            <option value="moda-beleza">Moda e Beleza</option>
            <option value="musica-artes">Música e Artes</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Idioma</label>
          <select
            value={localData.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
            <option value="ar">العربية</option>
            <option value="hi">हिन्दी</option>
            <option value="nl">Nederlands</option>
            <option value="sv">Svenska</option>
            <option value="no">Norsk</option>
            <option value="da">Dansk</option>
            <option value="fi">Suomi</option>
            <option value="pl">Polski</option>
            <option value="tr">Türkçe</option>
            <option value="th">ไทย</option>
            <option value="vi">Tiếng Việt</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="ms">Bahasa Melayu</option>
            <option value="tl">Tagalog</option>
            <option value="cs">Čeština</option>
            <option value="hu">Magyar</option>
            <option value="ro">Română</option>
            <option value="uk">Українська</option>
            <option value="el">Ελληνικά</option>
            <option value="he">עברית</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">Moeda</label>
          <select
            value={localData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          >
            <option value="BRL">R$ - Real Brasileiro</option>
            <option value="USD">$ - Dólar Americano</option>
            <option value="EUR">€ - Euro</option>
            <option value="GBP">£ - Libra Esterlina</option>
            <option value="JPY">¥ - Iene Japonês</option>
            <option value="CNY">¥ - Yuan Chinês</option>
            <option value="INR">₹ - Rúpia Indiana</option>
            <option value="CAD">C$ - Dólar Canadense</option>
            <option value="AUD">A$ - Dólar Australiano</option>
            <option value="CHF">Fr - Franco Suíço</option>
            <option value="SEK">kr - Coroa Sueca</option>
            <option value="NOK">kr - Coroa Norueguesa</option>
            <option value="DKK">kr - Coroa Dinamarquesa</option>
            <option value="NZD">NZ$ - Dólar Neozelandês</option>
            <option value="ZAR">R - Rand Sul-Africano</option>
            <option value="MXN">$ - Peso Mexicano</option>
            <option value="SGD">S$ - Dólar de Singapura</option>
            <option value="HKD">HK$ - Dólar de Hong Kong</option>
            <option value="KRW">₩ - Won Sul-Coreano</option>
            <option value="TRY">₺ - Lira Turca</option>
            <option value="RUB">₽ - Rublo Russo</option>
            <option value="PLN">zł - Zloty Polonês</option>
            <option value="THB">฿ - Baht Tailandês</option>
            <option value="IDR">Rp - Rupia Indonésia</option>
            <option value="MYR">RM - Ringgit Malaio</option>
            <option value="PHP">₱ - Peso Filipino</option>
            <option value="CZK">Kč - Coroa Checa</option>
            <option value="HUF">Ft - Florim Húngaro</option>
            <option value="RON">lei - Leu Romeno</option>
            <option value="ILS">₪ - Shekel Israelense</option>
            <option value="CLP">$ - Peso Chileno</option>
            <option value="ARS">$ - Peso Argentino</option>
            <option value="COP">$ - Peso Colombiano</option>
            <option value="PEN">S/ - Sol Peruano</option>
            <option value="AED">د.إ - Dirham dos EAU</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded p-3 space-y-2">
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={localData.skipOfferInfo}
            onChange={(e) => handleChange('skipOfferInfo', e.target.checked)}
            className="rounded"
          />
          Não informar ofertas
        </label>

        {!localData.skipOfferInfo && (
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2">
              <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Oferta Simples</h4>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={localData.offers.simple?.fullPrice || ''}
                  onChange={(e) =>
                    handleOfferChange('simple', 'fullPrice', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Preço cheio"
                />
                <input
                  type="number"
                  value={localData.offers.simple?.discountPrice || ''}
                  onChange={(e) =>
                    handleOfferChange('simple', 'discountPrice', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="C/ desconto"
                />
                <input
                  type="number"
                  value={localData.offers.simple?.quantity || 1}
                  onChange={(e) =>
                    handleOfferChange('simple', 'quantity', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Qtd"
                />
                <input
                  type="number"
                  value={localData.offers.simple?.treatmentDays || 30}
                  onChange={(e) =>
                    handleOfferChange('simple', 'treatmentDays', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Dias"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded p-2">
              <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Oferta Média</h4>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={localData.offers.medium?.fullPrice || ''}
                  onChange={(e) =>
                    handleOfferChange('medium', 'fullPrice', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Preço cheio"
                />
                <input
                  type="number"
                  value={localData.offers.medium?.discountPrice || ''}
                  onChange={(e) =>
                    handleOfferChange('medium', 'discountPrice', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="C/ desconto"
                />
                <input
                  type="number"
                  value={localData.offers.medium?.quantity || 3}
                  onChange={(e) =>
                    handleOfferChange('medium', 'quantity', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Qtd"
                />
                <input
                  type="number"
                  value={localData.offers.medium?.treatmentDays || 90}
                  onChange={(e) =>
                    handleOfferChange('medium', 'treatmentDays', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Dias"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded p-2">
              <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Melhor Oferta</h4>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={localData.offers.best?.fullPrice || ''}
                  onChange={(e) =>
                    handleOfferChange('best', 'fullPrice', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Preço cheio"
                />
                <input
                  type="number"
                  value={localData.offers.best?.discountPrice || ''}
                  onChange={(e) =>
                    handleOfferChange('best', 'discountPrice', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="C/ desconto"
                />
                <input
                  type="number"
                  value={localData.offers.best?.quantity || 6}
                  onChange={(e) =>
                    handleOfferChange('best', 'quantity', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Qtd"
                />
                <input
                  type="number"
                  value={localData.offers.best?.treatmentDays || 180}
                  onChange={(e) =>
                    handleOfferChange('best', 'treatmentDays', Number(e.target.value))
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  placeholder="Dias"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded p-3 space-y-2">
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={localData.skipWarrantyInfo}
            onChange={(e) => handleChange('skipWarrantyInfo', e.target.checked)}
            className="rounded"
          />
          Não informar garantia
        </label>

        {!localData.skipWarrantyInfo && (
          <input
            type="number"
            value={localData.warrantyDays || 90}
            onChange={(e) => handleChange('warrantyDays', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-blue-50"
            placeholder="Garantia (dias)"
          />
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded transition-colors text-sm"
      >
        Avançar
      </button>
    </div>
  );
}
