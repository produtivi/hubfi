'use client';

import { useState } from 'react';
import type { GoogleAdsAccount } from '../../types/campaign';

interface GoogleAdsSetupStepProps {
  data: GoogleAdsAccount;
  productName: string;
  onChange: (data: GoogleAdsAccount) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GoogleAdsSetupStep({
  data,
  productName,
  onChange,
  onNext,
  onBack,
}: GoogleAdsSetupStepProps) {
  const [localData, setLocalData] = useState<GoogleAdsAccount>(data);

  const handleChange = (field: keyof GoogleAdsAccount, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  const handleAddGoogleAccount = () => {
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleAddGoogleAccount}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Adicionar conta Google
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Suas contas do Gmail
        </label>
        <select
          value={localData.gmailAccounts[0] || ''}
          onChange={(e) => handleChange('gmailAccounts', [e.target.value])}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
        >
          <option value="">Selecione uma conta</option>
          <option value="caiocalderaro1989@gmail.com">caiocalderaro1989@gmail.com</option>
        </select>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Você vai criar uma nova MCC?
        </h3>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleChange('createNewMCC', true)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${localData.createNewMCC
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Sim
          </button>
          <button
            onClick={() => handleChange('createNewMCC', false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${!localData.createNewMCC
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Não
          </button>
        </div>

        {!localData.createNewMCC && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Suas contas MCC do Google ADS
            </label>
            <select
              value={localData.mccAccount || ''}
              onChange={(e) => handleChange('mccAccount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
            >
              <option value="">Selecione uma MCC</option>
              <option value="MCC - CAIO CALDERARO [ADM] (890-556-8550) (MCC)">
                MCC - CAIO CALDERARO [ADM] (890-556-8550) (MCC)
              </option>
            </select>
            <button className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium">
              Clique aqui se você não achou sua MCC
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Você deseja criar uma nova ação de conversão (pixel) no Google ADS?
        </h3>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleChange('createNewConversionAction', true)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${localData.createNewConversionAction
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Sim
          </button>
          <button
            onClick={() => handleChange('createNewConversionAction', false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${!localData.createNewConversionAction
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Não
          </button>
        </div>

        {!localData.createNewConversionAction && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Suas ações de conversão do Google ADS
            </label>
            <select
              value={localData.conversionAction || ''}
              onChange={(e) => handleChange('conversionAction', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
            >
              <option value="">Selecione uma ação</option>
              <option value="Dental - 20/6/2025">Dental - 20/6/2025</option>
            </select>
            <button className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium">
              Clique aqui se você não achou a ação de conversão (pixel)
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Você deseja criar uma nova conta no Google ADS?
        </h3>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleChange('createNewAdsAccount', true)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${localData.createNewAdsAccount
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Sim
          </button>
          <button
            onClick={() => handleChange('createNewAdsAccount', false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${!localData.createNewAdsAccount
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Não
          </button>
        </div>

        {!localData.createNewAdsAccount && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Suas contas do Google ADS
            </label>
            <select
              value={localData.adsAccount || ''}
              onChange={(e) => handleChange('adsAccount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
            >
              <option value="">Selecione uma conta</option>
              <option value="JC [teste] 24/10 (158-592-9044)">
                JC [teste] 24/10 (158-592-9044)
              </option>
            </select>
            <button className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium">
              Clique aqui se você não achou minha conta
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}
