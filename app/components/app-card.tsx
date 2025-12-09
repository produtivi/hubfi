import { type LucideIcon } from 'lucide-react';

interface AppCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  onAccess: () => void;
}

export function AppCard({ name, description, icon: Icon, onAccess }: AppCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-8 h-8 text-red-600" />
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-6 min-h-12">{description}</p>

      <button
        onClick={onAccess}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        Acessar agora
      </button>
    </div>
  );
}
