'use client';

import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
} from './ui/dialog';
import {
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     ResponsiveContainer
} from 'recharts';

interface TrafficDashboardModalProps {
     isOpen: boolean;
     onClose: () => void;
     productName: string;
     currentTraffic: number;
     averageTraffic: number;
     variation: number;
}

export function TrafficDashboardModal({
     isOpen,
     onClose,
     productName,
     currentTraffic,
     averageTraffic,
     variation
}: TrafficDashboardModalProps) {
     const formatNumber = (num: number) => {
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
          return num.toString();
     };

     const trafficData = [
          { month: 'jul. de 25', traffic: 280000 },
          { month: 'ago. de 25', traffic: 220000 },
          { month: 'set. de 25', traffic: 140000 }
     ];

     const countryData = [
          { country: 'Estados Unidos', visits: 13605066.72, percentage: 99.4 },
          { country: 'Brasil', visits: 87633.28, percentage: 0.6 }
     ];

     return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
               <DialogContent className="min-w-[70vw] border-border rounded-md bg-card p-2">
                    <div className="flex flex-col">
                         <DialogHeader className="px-6 py-4 border-b border-border bg-card">
                              <DialogTitle className="text-title text-foreground">
                                   Dashboard de Tráfego - {productName}
                              </DialogTitle>
                         </DialogHeader>

                         <div className="px-6 py-4 space-y-6">
                              {/* Métricas principais */}
                              <div className="grid grid-cols-3 gap-4">
                                   <div>
                                        <div className="text-label text-muted-foreground mb-1">Tráfego Atual</div>
                                        <div className="text-display font-serif text-primary">{formatNumber(currentTraffic)}</div>
                                        <div className="text-label text-muted-foreground">Último período</div>
                                   </div>
                                   <div>
                                        <div className="text-label text-muted-foreground mb-1">Média Histórica</div>
                                        <div className="text-display font-serif text-foreground">{formatNumber(averageTraffic)}</div>
                                        <div className="text-label text-muted-foreground">Todos os períodos</div>
                                   </div>
                                   <div>
                                        <div className="text-label text-muted-foreground mb-1">Variação</div>
                                        <div className={`text-display font-serif ${variation < 0 ? 'text-destructive' : 'text-success'}`}>
                                             {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                                        </div>
                                        <div className="text-label text-muted-foreground">Último período</div>
                                   </div>
                              </div>

                              {/* Indicadores de tendência */}
                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <div className="text-label text-muted-foreground mb-2">Tendência</div>
                                        <div className="inline-block px-3 py-1.5 bg-destructive/10 text-destructive text-label font-medium rounded-md">
                                             DESCENDO
                                        </div>
                                   </div>
                                   <div>
                                        <div className="text-label text-muted-foreground mb-2">Velocidade</div>
                                        <div className="inline-block px-3 py-1.5 bg-destructive/10 text-destructive text-label font-medium rounded-md">
                                             MUITO LENTA
                                        </div>
                                   </div>
                              </div>

                              {/* Gráfico de tráfego histórico */}
                              <div>
                                   <h3 className="text-body font-medium text-foreground mb-3">Histórico de Tráfego</h3>
                                   <div className="bg-card rounded-md border border-border p-4" style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                             <BarChart data={trafficData}>
                                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                  <XAxis
                                                       dataKey="month"
                                                       tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                                       tickLine={{ stroke: 'hsl(var(--border))' }}
                                                       axisLine={{ stroke: 'hsl(var(--border))' }}
                                                  />
                                                  <YAxis
                                                       tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                                       tickLine={{ stroke: 'hsl(var(--border))' }}
                                                       axisLine={{ stroke: 'hsl(var(--border))' }}
                                                       tickFormatter={(value) => {
                                                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                                            return value.toString();
                                                       }}
                                                  />
                                                  <Tooltip
                                                       contentStyle={{
                                                            backgroundColor: 'hsl(var(--card))',
                                                            border: '1px solid hsl(var(--border))',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            color: 'hsl(var(--foreground))'
                                                       }}
                                                       formatter={(value) => value !== undefined ? formatNumber(Number(value)) : ''}
                                                  />
                                                  <Bar dataKey="traffic" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                                             </BarChart>
                                        </ResponsiveContainer>
                                   </div>
                              </div>

                              {/* Principais países */}
                              <div>
                                   <h3 className="text-body font-medium text-foreground mb-3">Principais Países (Audiência)</h3>
                                   <div className="border border-border rounded-md overflow-hidden">
                                        <table className="w-full text-label">
                                             <tbody className="bg-card divide-y divide-border">
                                                  {countryData.map((item, index) => (
                                                       <tr key={index}>
                                                            <td className="px-4 py-3 font-medium text-foreground">{item.country}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                 <span className="text-primary font-semibold">
                                                                      {formatNumber(item.visits)}
                                                                 </span>
                                                                 <span className="text-muted-foreground ml-2">
                                                                      ({item.percentage}%)
                                                                 </span>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>

                         <div className="px-6 py-4 border-t border-border bg-muted flex justify-end">
                              <button
                                   onClick={onClose}
                                   className="px-6 py-2 bg-muted text-foreground rounded-md hover:bg-accent transition-colors font-medium text-label"
                              >
                                   Fechar
                              </button>
                         </div>
                    </div>
               </DialogContent>
          </Dialog>
     );
}
