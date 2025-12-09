export type CampaignStatus = 'publicada' | 'publicando' | 'rascunho' | 'pausada' | 'erro';

export interface CampaignListItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  mcc: string;
  accountId: string;
  name: string;
  pixelName: string;
  status: CampaignStatus;
}
