'use client';

import { useState, useMemo, useEffect } from 'react';
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

const RANKED_PRODUCTS: RankedProduct[] = [];

export default function RankingHub() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
	const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
	const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>('all');
	const [showFilters, setShowFilters] = useState(false);
	const [selectedKeyword, setSelectedKeyword] = useState<RankedProduct | null>(null);
	const [selectedTraffic, setSelectedTraffic] = useState<RankedProduct | null>(null);
	const [products, setProducts] = useState<RankedProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>('');
	const platforms = [
		{ id: 'all', name: 'Todas as plataformas' },
		{ id: 'clickbank', name: 'ClickBank' },
		{ id: 'buygoods', name: 'Buygoods' },
		{ id: 'gurumedia', name: 'Gurumedia' },
		{ id: 'maxweb', name: 'Maxweb' },
	];

	// Função para converter dados da API para formato da interface
	const transformApiData = (apiData: any[]): RankedProduct[] => {
		return apiData.map((item, index) => ({
			id: item.sku || `product-${index}`,
			name: item.keyword.replace(/\b\w/g, l => l.toUpperCase()), // Capitalizar
			platform: 'clickbank' as Platform,
			platform_logo: '/logos/clickbank-logo.svg', // Logo padrão
			keyword: item.keyword,
			ranking: item.position,
			searchVolume: parseFloat(item.volumeBusca.replace(/[KM]/g, '')) * (item.volumeBusca.includes('K') ? 1000 : item.volumeBusca.includes('M') ? 1000000 : 1),
			searchVolumeTrend: 'up' as const, // Simulado
			traffic: parseFloat(item.trafego.replace(/[KM]/g, '')) * (item.trafego.includes('K') ? 1000 : item.trafego.includes('M') ? 1000000 : 1),
			trafficTrend: 'stable' as const, // Simulado  
			gravity: item.gravidez,
			gravityTrend: 'up' as const, // Simulado
			commission: parseFloat(item.comissao),
			currency: 'USD' as const, // ClickBank usa USD
			rankingChange: Math.floor(Math.random() * 10 - 5) // Simulado -5 a +5
		}));
	};

	// Buscar dados da API
	useEffect(() => {
		const fetchRankingData = async () => {
			try {
				setIsLoading(true);
				setError('');
				
				console.log('🔍 Buscando dados do ranking...');
				
				// Buscar dados da ClickBank primeiro
				const response = await fetch('/api/ranking/clickbank');
				const result = await response.json();
				
				console.log('📊 Resposta da API:', result);
				
				if (result.success && result.data && result.data.length > 0) {
					const transformedProducts = transformApiData(result.data);
					setProducts(transformedProducts);
					console.log(`✅ ${transformedProducts.length} produtos carregados!`);
					
					// Mostrar warning se usar dados mock
					if (result.source === 'mock-data-temporary') {
						console.log('⚠️', result.warning);
					}
				} else {
					setProducts([]);
					if (result.source === 'system-rebuild') {
						setError('🚀 Sistema de inteligência de mercado em desenvolvimento - Use o botão "Testar Web Scraping" para ver como funciona!');
					} else {
						setError(result.message || 'Nenhum produto encontrado');
					}
				}
			} catch (error) {
				console.error('💥 Erro ao buscar ranking:', error);
				setError('Erro ao conectar com a API');
				setProducts([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRankingData();
	}, []);

	// Atualizar dados quando filtro de plataforma mudar
	useEffect(() => {
		if (selectedPlatform !== 'all') {
			// TODO: Implementar busca específica por plataforma
			console.log(`Filtro alterado para: ${selectedPlatform}`);
		}
	}, [selectedPlatform]);

	const filteredProducts = useMemo(() => {
		return products.filter((product: RankedProduct) => {
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
	}, [products, searchTerm, selectedPlatform, trendFilter, volumeFilter]);

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

			{filteredProducts.length === 0 && !isLoading && (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<p className="text-body text-muted-foreground mb-4">
						{error || 'Nenhum produto encontrado'}
					</p>
					{error ? (
						<button
							className="text-label text-foreground hover:text-muted-foreground transition-colors"
							onClick={() => window.location.reload()}
						>
							Tentar novamente
						</button>
					) : (
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
					)}
				</div>
			)}

			{isLoading && (
				<div className="bg-card border border-border rounded-md p-12 text-center">
					<p className="text-body text-muted-foreground">
						🔍 Buscando produtos do ranking...
					</p>
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
