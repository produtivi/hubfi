import Image from 'next/image';
import type { Platform } from '../types/product';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
}

export function PlatformSelector({ selectedPlatforms, onPlatformsChange }: PlatformSelectorProps) {
  const platforms: { id: Platform; name: string; img: string }[] = [
    { id: 'hotmart', name: 'Hotmart', img: '/platforms/hotmart.png' },
    { id: 'braip', name: 'Braip', img: '/platforms/braip.png' },
    { id: 'clickbank', name: 'ClickBank', img: '/platforms/clickbank.png' },
    { id: 'buygoods', name: 'BuyGoods', img: '/platforms/buygoods.png' },
    { id: 'kiwify', name: 'Kiwify', img: '/platforms/kiwify.png' },
    { id: 'monetizze', name: 'Monetizze', img: '/platforms/monetizze.png' },
    { id: 'digistoresa', name: 'Digistoresa', img: '/platforms/digistoresa.png' },
    { id: 'perfectpay', name: 'Perfect Pay', img: '/platforms/perfectpay.png' },
    { id: 'drcash', name: 'Dr.cash', img: '/platforms/drcash.png' },
    { id: 'gurumedia', name: 'GuruMedia', img: '/platforms/gurumedia.png' },
    { id: 'maxweb', name: 'Maxweb', img: '/platforms/maxweb.png' },
  ];

  const togglePlatform = (platformId: Platform) => {
    if (selectedPlatforms.includes(platformId)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platformId));
    } else {
      onPlatformsChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="bg-card rounded-md border border-border p-6">
      <h3 className="text-body font-medium text-foreground mb-4">Escolha sua plataforma</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 w-full lg:grid-cols-6 gap-3">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`p-4 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
                }`}
            >
              <Image
                width={150}
                height={0}
                src={platform.img}
                alt={platform.name}
                className='w-full h-12 object-contain'
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
