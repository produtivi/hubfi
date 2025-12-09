'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Plus, Trash2, CheckCircle, Hourglass, AlertCircle, Pause } from 'lucide-react';
import type { CampaignListItem } from '../../types/campaign-list';

const mockCampaigns: CampaignListItem[] = [
  {
    id: '1',
    createdAt: new Date('2025-11-14T18:21:07'),
    updatedAt: new Date('2025-11-14T18:26:21'),
    email: 'caiocalderaro1989@gmail.com',
    mcc: '890-556-8550',
    accountId: '240-731-4370',
    name: 'tonic greens - RP - 90 - 14/11/2025',
    pixelName: 'tonicgreens - 14/11/2025',
    status: 'publicada',
  },
  {
    id: '2',
    createdAt: new Date('2025-11-13T11:05:23'),
    updatedAt: new Date('2025-11-13T11:11:17'),
    email: 'novaaeraoperacao100k@gmail.com',
    mcc: '481-126-9927',
    accountId: '507-095-8339',
    name: 'nervecalm - RP - 57 - 13/11/2025',
    pixelName: 'NerveCalm - 13/11/2025',
    status: 'publicada',
  },
  {
    id: '3',
    createdAt: new Date('2025-11-11T18:38:18'),
    updatedAt: new Date('2025-11-11T18:41:25'),
    email: 'caiocalderaro1989@gmail.com',
    mcc: '890-556-8550',
    accountId: '158-592-9044',
    name: 'nervecalm - RP - 57 - 11/11/2025',
    pixelName: 'NerveCalm- 11/11/2025',
    status: 'publicada',
  },
  {
    id: '4',
    createdAt: new Date('2025-11-09T14:11:29'),
    updatedAt: new Date('2025-11-09T14:11:29'),
    email: 'caiocalderaro1989@gmail.com',
    mcc: '890-556-8550',
    accountId: '158-592-9044',
    name: 'lipovive - RP - 43 - 9/11/2025',
    pixelName: 'Lipovive',
    status: 'publicando',
  },
];

export default function CampaignsListPage() {
  const router = useRouter();
  const [campaigns] = useState<CampaignListItem[]>(mockCampaigns);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'publicada':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Publicada',
        };
      case 'publicando':
        return {
          icon: <Hourglass className="w-5 h-5" />,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'Publicando',
        };
      case 'pausada':
        return {
          icon: <Pause className="w-5 h-5" />,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Pausada',
        };
      case 'erro':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Erro',
        };
      default:
        return {
          icon: null,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: status,
        };
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-headline">Minhas Campanhas</h1>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/campaign-wizard')}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors text-label font-medium"
          >
            <Plus className="w-5 h-5" />
            Criar campanha
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors text-label font-medium">
            Análise de campanha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((campaign) => {
          const statusConfig = getStatusConfig(campaign.status);

          return (
            <div
              key={campaign.id}
              className="bg-card border border-border rounded-md p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-body font-medium text-foreground mb-1">
                    {campaign.name}
                  </h3>
                  <p className="text-label text-muted-foreground">
                    {formatDate(campaign.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${statusConfig.bgColor}`}>
                    <span className={statusConfig.color}>{statusConfig.icon}</span>
                    <span className={`text-label font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-label mb-1">E-mail</p>
                  <p className="text-body text-foreground truncate" title={campaign.email}>
                    {campaign.email}
                  </p>
                </div>
                <div>
                  <p className="text-label mb-1">Pixel</p>
                  <p className="text-body text-foreground truncate" title={campaign.pixelName}>
                    {campaign.pixelName}
                  </p>
                </div>
                <div>
                  <p className="text-label mb-1">MCC</p>
                  <p className="text-body font-mono text-foreground">{campaign.mcc}</p>
                </div>
                <div>
                  <p className="text-label mb-1">Conta</p>
                  <p className="text-body font-mono text-foreground">{campaign.accountId}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
