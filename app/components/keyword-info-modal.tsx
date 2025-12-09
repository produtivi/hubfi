'use client';

import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
} from '@/components/ui/dialog';
import {
     LineChart,
     Line,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     ResponsiveContainer
} from 'recharts';

interface KeywordInfoModalProps {
     isOpen: boolean;
     onClose: () => void;
     keyword: string;
     searchVolume: number;
     searchVolumeTrend: 'up' | 'down' | 'stable';
}

export function KeywordInfoModal({
     isOpen,
     onClose,
     keyword,
     searchVolume,
     searchVolumeTrend
}: KeywordInfoModalProps) {
     const formatNumber = (num: number) => {
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
          return num.toString();
     };

     return (
          <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
               <DialogContent className="min-w-[74vw] w-[90vw] h-[90vh] border-border rounded-md bg-card p-0">
                    <div className="flex flex-col h-full">
                         <DialogHeader className="px-6 py-4 border-b border-border bg-card">
                              <DialogTitle className="text-title  text-foreground">
                                   Informações da Palavra-chave: &quot;{keyword}&quot;
                              </DialogTitle>
                         </DialogHeader>

                         <div className="flex-1 px-6 py-4 overflow-y-auto">
                              <div className="flex flex-col gap-6 h-full">
                                   <div className="space-y-4">
                                        <div>
                                             <label className="block text-label mb font-medium text-foreground mb-2">
                                                  Adicionar país para comparação:
                                             </label>
                                             <select className="w-full px-4 py-2 border border-border bg-card text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none text-label">
                                                  <option value="">Selecione um país...</option>
                                                  <option value="BR">Brasil</option>
                                                  <option value="US">Estados Unidos</option>
                                                  <option value="GB">Reino Unido</option>
                                                  <option value="CA">Canadá</option>
                                                  <option value="AU">Austrália</option>
                                                  <option value="DE">Alemanha</option>
                                                  <option value="FR">França</option>
                                                  <option value="IT">Itália</option>
                                                  <option value="ES">Espanha</option>
                                                  <option value="PT">Portugal</option>
                                                  <option value="MX">México</option>
                                                  <option value="AR">Argentina</option>
                                             </select>
                                             <div className="mt-4">
                                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-label rounded-full">
                                                       Global
                                                       <button className="hover:bg-primary/80 rounded-full">×</button>
                                                  </span>
                                             </div>
                                        </div>

                                        <div>
                                             <h3 className="text-body font-medium text-foreground mb-3">Tabela Comparativa</h3>
                                             <div className="border border-border rounded-md overflow-hidden">
                                                  <table className="w-full text-label">
                                                       <thead className="bg-muted">
                                                            <tr>
                                                                 <th className="px-4 py-3 text-left font-medium text-foreground uppercase border-b border-border">País</th>
                                                                 <th className="px-4 py-3 text-center font-medium text-foreground uppercase border-b border-border">Buscas/Mês</th>
                                                                 <th className="px-4 py-3 text-center font-medium text-foreground uppercase border-b border-border">CPC</th>
                                                                 <th className="px-4 py-3 text-center font-medium text-foreground uppercase border-b border-border">Conc.</th>
                                                                 <th className="px-4 py-3 text-center font-medium text-foreground uppercase border-b border-border">Tendência</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody className="bg-card">
                                                            <tr>
                                                                 <td className="px-4 py-3 font-medium text-foreground">Global</td>
                                                                 <td className="px-4 py-3 text-foreground text-center">{formatNumber(searchVolume)}</td>
                                                                 <td className="px-4 py-3 text-foreground text-center">$33.36</td>
                                                                 <td className="px-4 py-3 text-center">
                                                                      <span className="inline-block px-3 py-1 bg-success/10 text-success font-medium rounded-full">
                                                                           BAIXA
                                                                      </span>
                                                                 </td>
                                                                 <td className="px-4 py-3 text-center">
                                                                      <span className={`inline-block px-3 py-1 font-medium rounded-full ${searchVolumeTrend === 'up' ? 'bg-success/10 text-success' :
                                                                           searchVolumeTrend === 'down' ? 'bg-destructive/10 text-destructive' :
                                                                                'bg-muted text-muted-foreground'
                                                                           }`}>
                                                                           {searchVolumeTrend === 'up' ? 'SUBINDO' :
                                                                                searchVolumeTrend === 'down' ? 'DESCENDO' : 'ESTÁVEL'}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="flex flex-col h-full">
                                        <h3 className="text-body font-medium text-foreground mb-3">Histórico de Volume de Buscas</h3>
                                        <div className="bg-card rounded-md p-4 border border-border flex-1 min-h-[400px]">
                                             <ResponsiveContainer width="100%" height="100%">
                                                  <LineChart
                                                       data={[
                                                            { month: '10/24', volume: 15000 },
                                                            { month: '11/24', volume: 18000 },
                                                            { month: '12/24', volume: 22000 },
                                                            { month: '01/25', volume: 25000 },
                                                            { month: '02/25', volume: 20000 },
                                                            { month: '03/25', volume: 19000 },
                                                            { month: '04/25', volume: 21000 },
                                                            { month: '05/25', volume: 23000 },
                                                            { month: '06/25', volume: 24000 },
                                                            { month: '07/25', volume: 22000 },
                                                            { month: '08/25', volume: 28000 },
                                                            { month: '09/25', volume: 95000 }
                                                       ]}
                                                       margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                                  >
                                                       <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                       <XAxis
                                                            dataKey="month"
                                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                                            tickLine={{ stroke: 'hsl(var(--border))' }}
                                                            axisLine={{ stroke: 'hsl(var(--border))' }}
                                                       />
                                                       <YAxis
                                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
                                                            formatter={(value: number) => {
                                                                 if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                                                 return value.toString();
                                                            }}
                                                       />
                                                       <Legend
                                                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                                            iconType="line"
                                                       />
                                                       <Line
                                                            type="monotone"
                                                            dataKey="volume"
                                                            stroke="hsl(var(--primary))"
                                                            strokeWidth={3}
                                                            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                            name="Global"
                                                       />
                                                  </LineChart>
                                             </ResponsiveContainer>
                                        </div>
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
