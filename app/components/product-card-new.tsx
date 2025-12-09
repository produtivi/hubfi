import Image from 'next/image';
import { Star, ExternalLink, Info, Heart, Flame, AlertCircle } from 'lucide-react';
import type { Product } from '../types/product';

interface ProductCardNewProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export function ProductCardNew({ product, isFavorite = false, onToggleFavorite }: ProductCardNewProps) {
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-success fill-success' : 'text-muted-foreground'}`}
        />
      );
    }
    return stars;
  };

  const getTemperatureConfig = (temp: number) => {
    if (temp >= 100) return { color: 'text-destructive', bg: 'bg-destructive/10' };
    if (temp >= 50) return { color: 'text-warning', bg: 'bg-warning/10' };
    return { color: 'text-primary', bg: 'bg-primary/10' };
  };

  const tempConfig = getTemperatureConfig(product.temperature);

  return (
    <div className="bg-card rounded-md border border-border hover:shadow-sm transition-shadow p-6">
      <div className="flex gap-6">
        {product.thumbnailUrl && (
          <div className="w-40 h-40 shrink-0 relative rounded-md overflow-hidden bg-muted">
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-body font-medium text-foreground mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-label text-primary">{product.creator}</p>
            </div>
            <button
              onClick={() => onToggleFavorite?.(product)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'text-destructive fill-destructive' : ''}`} />
            </button>
          </div>

          <p className="text-label text-muted-foreground mb-3 capitalize">{product.niche}</p>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(product.score)}
              </div>
              <span className="text-label text-muted-foreground">({product.reviewCount})</span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${tempConfig.bg}`}>
              <Flame className={`w-5 h-5 ${tempConfig.color}`} />
              <span className={`text-label font-medium ${tempConfig.color}`}>{product.temperature}</span>
            </div>

            <div className="flex items-center gap-2 text-label text-muted-foreground">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary font-semibold">
                {product.platform.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium">{product.commissionPercent}%</span>
            </div>
          </div>

          {!product.isAvailableForAffiliation && (
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-md mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-label font-medium">Indisponível para afiliação</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-label mb-1">Preço do produto</p>
              <p className="text-body font-medium text-success">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-label mb-1">Comissão</p>
              <p className="text-body font-medium text-success">
                R$ {product.commissionValue.toFixed(2)} ({product.commissionPercent}%)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-card border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-md text-label font-medium transition-colors">
              Atalhos rápidos
            </button>
            <button className="flex items-center justify-center gap-2 bg-card border border-border text-foreground hover:bg-accent px-4 py-2 rounded-md text-label font-medium transition-colors">
              <Info className="w-5 h-5" />
              Info. Google ADS
            </button>
            <a
              href={product.salesPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded-md text-label font-medium transition-colors"
            >
              <span className="capitalize">{product.platform}</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
