'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProductInfoStep } from '../components/campaign-wizard/product-info-step';
import { GoogleAdsSetupStep } from '../components/campaign-wizard/google-ads-setup-step';
import { CampaignConfigStep } from '../components/campaign-wizard/campaign-config-step';
import type { CampaignData, CampaignFormStep } from '../types/campaign';

const initialCampaignData: CampaignData = {
  productInfo: {
    name: '',
    type: 'fisico',
    niche: 'dental',
    language: 'pt',
    currency: 'BRL',
    offers: {},
    skipOfferInfo: false,
    skipWarrantyInfo: false,
  },
  googleAdsAccount: {
    gmailAccounts: [],
    createNewMCC: false,
    createNewConversionAction: false,
    createNewAdsAccount: false,
  },
  campaignConfig: {
    name: '',
    strategy: 'maximizar-cliques',
    country: 'Brasil',
  },
  campaignAssets: {
    bidStrategy: 'maximizar-cliques',
    keywords: [],
    titles: [],
    descriptions: [],
    headlines: [],
    sitelinks: [],
    priceExtensions: [],
    promotions: [],
  },
  isFilteringEnabled: false,
};

export default function CampaignWizardPage() {
  const [currentStep, setCurrentStep] = useState<CampaignFormStep>('product-info');
  const [campaignData, setCampaignData] = useState<CampaignData>(initialCampaignData);

  const handleNext = () => {
    if (currentStep === 'product-info') {
      setCurrentStep('google-ads-setup');
    } else if (currentStep === 'google-ads-setup') {
      setCurrentStep('campaign-config');
    } else if (currentStep === 'campaign-config') {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'google-ads-setup') {
      setCurrentStep('product-info');
    } else if (currentStep === 'campaign-config') {
      setCurrentStep('google-ads-setup');
    } else if (currentStep === 'review') {
      setCurrentStep('campaign-config');
    }
  };

  const handleSave = async () => {
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="bg-card rounded-md border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            {currentStep !== 'product-info' && (
              <button
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-title flex items-center gap-2">
              <span>Campanha</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-primary">Google Ads</span>
            </h1>
          </div>

          {currentStep === 'product-info' && (
            <ProductInfoStep
              data={campaignData.productInfo}
              onChange={(productInfo) =>
                setCampaignData({ ...campaignData, productInfo })
              }
              onNext={handleNext}
            />
          )}

          {currentStep === 'google-ads-setup' && (
            <GoogleAdsSetupStep
              data={campaignData.googleAdsAccount}
              productName={campaignData.productInfo.name}
              onChange={(googleAdsAccount) =>
                setCampaignData({ ...campaignData, googleAdsAccount })
              }
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'campaign-config' && (
            <CampaignConfigStep
              data={campaignData}
              onChange={setCampaignData}
              onSave={handleSave}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
