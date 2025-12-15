'use client';

import { useState, useMemo } from 'react';
import { KeywordInfoModal } from '../components/keyword-info-modal';
import { TrafficDashboardModal } from '../components/traffic-dashboard-modal';
import {
	Search,
	RefreshCw,
	Filter,
	Info,
	TrendingUp,
	TrendingDown,
	Minus,
	ExternalLink
} from 'lucide-react';
import type { Platform } from '../types/product';
import Image from 'next/image';

interface RankedProduct {
	id: string;
	name: string;
	platform: Platform;
	platform_logo: string;
	keyword: string;
	ranking: number;
	searchVolume: number;
	searchVolumeTrend: 'up' | 'down' | 'stable';
	traffic: number;
	trafficTrend: 'up' | 'down' | 'stable';
	gravity: number;
	gravityTrend: 'up' | 'down' | 'stable';
	commission: number;
	currency: 'BRL' | 'USD';
	rankingChange: number;
}

type TrendFilter = 'all' | 'rising' | 'falling' | 'stable';
type VolumeFilter = 'all' | 'hot' | 'warm' | 'cold';

const RANKED_PRODUCTS: RankedProduct[] = [
	{
		id: '1',
		name: 'mitolyn',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'mitolyn',
		ranking: 1,
		searchVolume: 74000,
		searchVolumeTrend: 'up',
		traffic: 1000000,
		trafficTrend: 'up',
		gravity: 390,
		gravityTrend: 'stable',
		commission: 188.59,
		currency: 'USD',
		rankingChange: 0
	},
	{
		id: '2',
		name: 'ProstaVive - Powerhouse Prostate',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'prostavive',
		ranking: 2,
		searchVolume: 14800,
		searchVolumeTrend: 'stable',
		traffic: 165900,
		trafficTrend: 'up',
		gravity: 235,
		gravityTrend: 'up',
		commission: 148.54,
		currency: 'USD',
		rankingChange: 1
	},
	{
		id: '3',
		name: 'ProDentim - The Biggest Monster',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'prodentim',
		ranking: 3,
		searchVolume: 33100,
		searchVolumeTrend: 'down',
		traffic: 548400,
		trafficTrend: 'down',
		gravity: 157,
		gravityTrend: 'down',
		commission: 159.98,
		currency: 'USD',
		rankingChange: -1
	},
	{
		id: '4',
		name: 'Nagano Tonic',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'nagano tonic',
		ranking: 4,
		searchVolume: 22100,
		searchVolumeTrend: 'up',
		traffic: 301000,
		trafficTrend: 'up',
		gravity: 198,
		gravityTrend: 'up',
		commission: 142.30,
		currency: 'USD',
		rankingChange: 2
	},
	{
		id: '5',
		name: 'Sugar Defender',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'sugar defender',
		ranking: 5,
		searchVolume: 49500,
		searchVolumeTrend: 'up',
		traffic: 673200,
		trafficTrend: 'stable',
		gravity: 312,
		gravityTrend: 'stable',
		commission: 175.45,
		currency: 'USD',
		rankingChange: 0
	},
	{
		id: '6',
		name: 'Fórmula Negócio Online',
		platform: 'hotmart',
		platform_logo: '/platforms/hotmart.png',
		keyword: 'formula negocio online',
		ranking: 6,
		searchVolume: 18200,
		searchVolumeTrend: 'up',
		traffic: 245000,
		trafficTrend: 'up',
		gravity: 289,
		gravityTrend: 'up',
		commission: 497.00,
		currency: 'BRL',
		rankingChange: 3
	},
	{
		id: '7',
		name: 'Detox Slim',
		platform: 'monetizze',
		platform_logo: '/platforms/monetizze.png',
		keyword: 'detox slim',
		ranking: 7,
		searchVolume: 38900,
		searchVolumeTrend: 'down',
		traffic: 512000,
		trafficTrend: 'down',
		gravity: 276,
		gravityTrend: 'stable',
		commission: 127.90,
		currency: 'BRL',
		rankingChange: -2
	},
	{
		id: '8',
		name: 'Curso de Inglês do Jerry',
		platform: 'hotmart',
		platform_logo: '/platforms/hotmart.png',
		keyword: 'curso ingles jerry',
		ranking: 8,
		searchVolume: 27400,
		searchVolumeTrend: 'stable',
		traffic: 389000,
		trafficTrend: 'up',
		gravity: 321,
		gravityTrend: 'up',
		commission: 387.00,
		currency: 'BRL',
		rankingChange: 1
	},
	{
		id: '9',
		name: 'Emagrecer de Vez',
		platform: 'kiwify',
		platform_logo: '/platforms/kiwify.png',
		keyword: 'emagrecer de vez',
		ranking: 9,
		searchVolume: 52100,
		searchVolumeTrend: 'up',
		traffic: 698000,
		trafficTrend: 'up',
		gravity: 264,
		gravityTrend: 'stable',
		commission: 197.00,
		currency: 'BRL',
		rankingChange: 0
	},
	{
		id: '10',
		name: 'The Ex Factor Guide',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'ex factor guide',
		ranking: 10,
		searchVolume: 12300,
		searchVolumeTrend: 'down',
		traffic: 187000,
		trafficTrend: 'stable',
		gravity: 198,
		gravityTrend: 'down',
		commission: 132.45,
		currency: 'USD',
		rankingChange: -1
	},
	{
		id: '11',
		name: 'Tráfego Orgânico no Instagram',
		platform: 'hotmart',
		platform_logo: '/platforms/hotmart.png',
		keyword: 'trafego organico instagram',
		ranking: 11,
		searchVolume: 23600,
		searchVolumeTrend: 'up',
		traffic: 321000,
		trafficTrend: 'up',
		gravity: 287,
		gravityTrend: 'up',
		commission: 297.00,
		currency: 'BRL',
		rankingChange: 4
	},
	{
		id: '12',
		name: 'Ikigai Weight Loss',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'ikigai weight loss',
		ranking: 12,
		searchVolume: 19800,
		searchVolumeTrend: 'stable',
		traffic: 267000,
		trafficTrend: 'stable',
		gravity: 223,
		gravityTrend: 'stable',
		commission: 156.78,
		currency: 'USD',
		rankingChange: 0
	},
	{
		id: '13',
		name: 'Método Fan Page Lucrativa',
		platform: 'braip',
		platform_logo: '/platforms/braip.png',
		keyword: 'fan page lucrativa',
		ranking: 13,
		searchVolume: 8900,
		searchVolumeTrend: 'down',
		traffic: 134000,
		trafficTrend: 'down',
		gravity: 176,
		gravityTrend: 'down',
		commission: 247.00,
		currency: 'BRL',
		rankingChange: -3
	},
	{
		id: '14',
		name: 'Java Burn',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'java burn',
		ranking: 14,
		searchVolume: 61200,
		searchVolumeTrend: 'up',
		traffic: 823000,
		trafficTrend: 'up',
		gravity: 345,
		gravityTrend: 'stable',
		commission: 164.32,
		currency: 'USD',
		rankingChange: 2
	},
	{
		id: '15',
		name: 'Segredo da Conquista',
		platform: 'monetizze',
		platform_logo: '/platforms/monetizze.png',
		keyword: 'segredo da conquista',
		ranking: 15,
		searchVolume: 16700,
		searchVolumeTrend: 'stable',
		traffic: 223000,
		trafficTrend: 'stable',
		gravity: 192,
		gravityTrend: 'stable',
		commission: 147.90,
		currency: 'BRL',
		rankingChange: 0
	},
	{
		id: '16',
		name: 'The Smoothie Diet',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'smoothie diet',
		ranking: 16,
		searchVolume: 28900,
		searchVolumeTrend: 'up',
		traffic: 392000,
		trafficTrend: 'up',
		gravity: 267,
		gravityTrend: 'stable',
		commission: 143.21,
		currency: 'USD',
		rankingChange: 1
	},
	{
		id: '17',
		name: 'Fórmula do Lançamento',
		platform: 'hotmart',
		platform_logo: '/platforms/hotmart.png',
		keyword: 'formula do lancamento',
		ranking: 17,
		searchVolume: 11200,
		searchVolumeTrend: 'down',
		traffic: 156000,
		trafficTrend: 'down',
		gravity: 234,
		gravityTrend: 'down',
		commission: 697.00,
		currency: 'BRL',
		rankingChange: -2
	},
	{
		id: '18',
		name: 'Kerassentials',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'kerassentials',
		ranking: 18,
		searchVolume: 34500,
		searchVolumeTrend: 'up',
		traffic: 467000,
		trafficTrend: 'up',
		gravity: 289,
		gravityTrend: 'up',
		commission: 152.89,
		currency: 'USD',
		rankingChange: 3
	},
	{
		id: '19',
		name: 'Treino Hipertrofia em Casa',
		platform: 'kiwify',
		platform_logo: '/platforms/kiwify.png',
		keyword: 'treino hipertrofia casa',
		ranking: 19,
		searchVolume: 9800,
		searchVolumeTrend: 'stable',
		traffic: 143000,
		trafficTrend: 'stable',
		gravity: 167,
		gravityTrend: 'stable',
		commission: 97.00,
		currency: 'BRL',
		rankingChange: 0
	},
	{
		id: '20',
		name: 'His Secret Obsession',
		platform: 'clickbank',
		platform_logo: '/platforms/clickbank.png',
		keyword: 'his secret obsession',
		ranking: 20,
		searchVolume: 15600,
		searchVolumeTrend: 'down',
		traffic: 209000,
		trafficTrend: 'down',
		gravity: 201,
		gravityTrend: 'stable',
		commission: 138.67,
		currency: 'USD',
		rankingChange: -1
	}
];

export default function RankingHub() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
	const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
	const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>('all');
	const [showFilters, setShowFilters] = useState(false);
	const [selectedKeyword, setSelectedKeyword] = useState<RankedProduct | null>(null);
	const [selectedTraffic, setSelectedTraffic] = useState<RankedProduct | null>(null);

	const platforms = [
		{ id: 'all', name: 'Todas' },
		{ id: 'clickbank', name: 'ClickBank' },
		{ id: 'hotmart', name: 'Hotmart' },
		{ id: 'braip', name: 'Braip' },
		{ id: 'kiwify', name: 'Kiwify' },
		{ id: 'monetizze', name: 'Monetizze' },
	];

	const filteredProducts = useMemo(() => {
		return RANKED_PRODUCTS.filter((product: RankedProduct) => {
			if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
				!product.keyword.toLowerCase().includes(searchTerm.toLowerCase())) {
				return false;
			}

			if (selectedPlatform !== 'all' && product.platform !== selectedPlatform) {
				return false;
			}

			if (trendFilter === 'rising' && product.rankingChange <= 0) return false;
			if (trendFilter === 'falling' && product.rankingChange >= 0) return false;
			if (trendFilter === 'stable' && product.rankingChange !== 0) return false;

			if (volumeFilter === 'hot' && product.searchVolume < 50000) return false;
			if (volumeFilter === 'warm' && (product.searchVolume < 10000 || product.searchVolume >= 50000)) return false;
			if (volumeFilter === 'cold' && product.searchVolume >= 10000) return false;

			return true;
		});
	}, [searchTerm, selectedPlatform, trendFilter, volumeFilter]);

	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
		if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
		if (trend === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
		return <Minus className="w-4 h-4 text-muted-foreground" />;
	};

	return (
		<div className="min-h-screen p-8">
			<div className="mb-8">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h1 className="text-headline mb-2">HubRanking</h1>
						<p className="text-body-muted">
							Acompanhe os produtos mais populares em tempo real
						</p>
					</div>
					<button className="flex items-center gap-2 px-4 py-2 bg-primary-foreground text-foreground border border-border rounded-md hover:opacity-80 transition-opacity">
						<RefreshCw className="w-4 h-4" />
						<span className="text-label font-medium">Atualizar</span>
					</button>
				</div>

				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
					<input
						type="text"
						placeholder="Buscar produto ou palavra-chave..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-md text-body text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-none"
					/>
				</div>
			</div>

			<div className="mb-6">
				<button
					onClick={() => setShowFilters(!showFilters)}
					className="flex items-center gap-2 text-body text-foreground hover:text-muted-foreground transition-colors"
				>
					<Filter className="w-4 h-4" />
					<span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
				</button>
			</div>

			{showFilters && (
				<div className="bg-card border border-border rounded-md p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-label mb-2">Plataforma</label>
							<select
								value={selectedPlatform}
								onChange={(e) => setSelectedPlatform(e.target.value as Platform | 'all')}
								className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
							>
								{platforms.map(platform => (
									<option key={platform.id} value={platform.id}>
										{platform.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-label mb-2">Volume de Busca</label>
							<select
								value={volumeFilter}
								onChange={(e) => setVolumeFilter(e.target.value as VolumeFilter)}
								className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
							>
								<option value="all">Todos</option>
								<option value="hot">Quente (&gt;50K)</option>
								<option value="warm">Morno (10K-50K)</option>
								<option value="cold">Frio (&lt;10K)</option>
							</select>
						</div>
						<div>
							<label className="block text-label mb-2">Tendência</label>
							<select
								value={trendFilter}
								onChange={(e) => setTrendFilter(e.target.value as TrendFilter)}
								className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
							>
								<option value="all">Todas</option>
								<option value="rising">Em Alta</option>
								<option value="falling">Em Baixa</option>
								<option value="stable">Estável</option>
							</select>
						</div>
					</div>

					<button
						className="mt-4 text-label text-muted-foreground hover:text-foreground transition-colors"
						onClick={() => {
							setSelectedPlatform('all');
							setTrendFilter('all');
							setVolumeFilter('all');
							setSearchTerm('');
						}}
					>
						Limpar Filtros
					</button>
				</div>
			)}

			<div className="mb-4">
				<p className="text-label text-muted-foreground">
					<span className="text-foreground font-medium">{filteredProducts.length}</span> produtos encontrados
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{filteredProducts.map((product) => (
					<div
						key={product.id}
						className="bg-card border border-border rounded-md p-6 hover:shadow-sm transition-shadow"
					>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-start gap-4">
								<div className="text-display font-serif text-foreground">
									{product.ranking}
								</div>
								<div className="flex flex-col">
									<div className="flex flex-col items-start gap-2 mb-1">
										<h3 className="text-body font-medium text-foreground ">
											{product.name}
										</h3>
										<div className="flex items-center gap-2">
											<p className="text-label text-muted-foreground">
												{product.keyword}
											</p>
											<button
												onClick={() => setSelectedKeyword(product)}
												className="text-muted-foreground hover:text-foreground transition-colors"
											>
												<Info className="w-3 h-3" />
											</button>
										</div>
									</div>

								</div>
								<Image
									src={product.platform_logo}
									alt={product.platform}
									width={90}
									height={32}
									className="border-l pl-2 border-border "
								/>
							</div>
							<button className="text-muted-foreground hover:text-foreground transition-colors">
								<ExternalLink className="w-4 h-4" />
							</button>
						</div>

						<div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
							<div>
								<p className="text-label mb-1">Volume</p>
								<div className="flex items-center gap-1">
									<p className="text-body font-medium text-foreground">
										{formatNumber(product.searchVolume)}
									</p>
									{getTrendIcon(product.searchVolumeTrend)}
								</div>
							</div>
							<div>
								<p className="text-label mb-1">Tráfego</p>
								<div className="flex items-center gap-1">
									<button
										onClick={() => setSelectedTraffic(product)}
										className="text-body font-medium text-foreground hover:underline"
									>
										{formatNumber(product.traffic)}
									</button>
									{getTrendIcon(product.trafficTrend)}
								</div>
							</div>
							<div>
								<p className="text-label mb-1">Gravidade</p>
								<div className="flex items-center gap-1">
									<p className="text-body font-medium text-foreground">
										{product.gravity}
									</p>
									{getTrendIcon(product.gravityTrend)}
								</div>
							</div>
							<div>
								<p className="text-label mb-1">Comissão</p>
								<p className="text-body font-medium text-success">
									{product.currency === 'BRL' ? 'R$' : '$'}{product.commission.toFixed(2)}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{filteredProducts.length === 0 && (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<p className="text-body text-muted-foreground mb-4">
						Nenhum produto encontrado
					</p>
					<button
						className="text-label text-foreground hover:text-muted-foreground transition-colors"
						onClick={() => {
							setSelectedPlatform('all');
							setTrendFilter('all');
							setVolumeFilter('all');
							setSearchTerm('');
						}}
					>
						Limpar filtros
					</button>
				</div>
			)}

			{selectedKeyword && (
				<KeywordInfoModal
					isOpen={selectedKeyword !== null}
					onClose={() => setSelectedKeyword(null)}
					keyword={selectedKeyword.keyword}
					searchVolume={selectedKeyword.searchVolume}
					searchVolumeTrend={selectedKeyword.searchVolumeTrend}
				/>
			)}

			{selectedTraffic && (
				<TrafficDashboardModal
					isOpen={selectedTraffic !== null}
					onClose={() => setSelectedTraffic(null)}
					productName={selectedTraffic.name}
					currentTraffic={selectedTraffic.traffic}
					averageTraffic={210185}
					variation={-35.3}
				/>
			)}
		</div>
	);
}
