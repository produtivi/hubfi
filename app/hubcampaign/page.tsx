'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Pause, MoreVertical, ExternalLink } from 'lucide-react';
import { Plus, SearchLg } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';

interface Campaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  budget: number;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  createdAt: string;
}

export default function HubCampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Fetch campaigns from API
    // Por enquanto, mostra estado vazio
    setIsLoading(false);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-headline mb-2">HubCampaign</h1>
        <p className="text-body-muted">
          Gerencie suas campanhas do Google Ads
        </p>
      </div>

      {/* Barra de busca e ações */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(value: string) => setSearchQuery(value)}
            icon={SearchLg}
          />
        </div>

        <Button
          color="primary"
          size="md"
          iconLeading={Plus}
          onClick={() => router.push('/hubcampaign/create')}
        >
          Criar nova campanha
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-label text-muted-foreground">
          <span className="text-foreground font-medium">{filteredCampaigns.length}</span> campanhas encontradas
        </p>
      </div>

      {/* Lista de campanhas */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground">
            Carregando campanhas...
          </p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground mb-4">
            {searchQuery ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha criada ainda'}
          </p>
          {!searchQuery && (
            <Button
              color="primary"
              size="md"
              iconLeading={Plus}
              onClick={() => router.push('/hubcampaign/create')}
            >
              Criar primeira campanha
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-card border border-border rounded-md p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-title">{campaign.name}</h3>
                  <p className="text-label text-muted-foreground mt-1">
                    Orçamento: R$ {campaign.budget.toFixed(2)}/dia
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-label ${
                      campaign.status === 'ENABLED'
                        ? 'bg-success/10 text-success'
                        : campaign.status === 'PAUSED'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {campaign.status === 'ENABLED' ? (
                      <>
                        <Activity className="w-3 h-3" />
                        Ativa
                      </>
                    ) : campaign.status === 'PAUSED' ? (
                      <>
                        <Pause className="w-3 h-3" />
                        Pausada
                      </>
                    ) : (
                      'Removida'
                    )}
                  </span>

                  <button className="p-2 hover:bg-accent rounded-md transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-label text-muted-foreground">Cliques</p>
                  <p className="text-body font-medium">{campaign.clicks}</p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground">Impressões</p>
                  <p className="text-body font-medium">{campaign.impressions}</p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground">Custo</p>
                  <p className="text-body font-medium">R$ {campaign.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-label text-muted-foreground">Conversões</p>
                  <p className="text-body font-medium">{campaign.conversions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
