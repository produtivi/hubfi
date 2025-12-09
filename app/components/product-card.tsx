import { Star, TrendingUp, DollarSign, ExternalLink, Flame, Thermometer, Snowflake } from 'lucide-react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const getTemperatureIcon = () => {
    switch (product.temperature) {
      case 'hot':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'warm':
        return <Thermometer className="w-4 h-4 text-orange-500" />;
      case 'cold':
        return <Snowflake className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTemperatureLabel = () => {
    switch (product.temperature) {
      case 'hot':
        return 'Quente';
      case 'warm':
        return 'Morno';
      case 'cold':
        return 'Frio';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg flex-1 pr-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-sm font-medium">
          {getTemperatureIcon()}
          <span className="text-gray-700">{getTemperatureLabel()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Star className="text-yellow-500 w-5 h-5" />
          <div>
            <p className="text-xs text-gray-500">Score</p>
            <p className="font-semibold text-gray-900">{product.score}/10</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="text-green-500 w-5 h-5" />
          <div>
            <p className="text-xs text-gray-500">Comissão</p>
            <p className="font-semibold text-gray-900">{product.commission}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-500 w-5 h-5" />
          <div>
            <p className="text-xs text-gray-500">Ticket médio</p>
            <p className="font-semibold text-gray-900">
              R$ {product.averageTicket.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
            {product.platform.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-500">Plataforma</p>
            <p className="font-semibold text-gray-900 capitalize text-sm">
              {product.platform}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={product.salesPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Ver página
        </a>
        <button
          onClick={() => onViewDetails(product)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
