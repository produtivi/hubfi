'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Filter, Activity, Eye, EyeOff, MoreVertical, Copy, Trash2, Edit2, X, TestTube, FileText, LayoutDashboard, Shield, Zap, ShoppingCart } from 'lucide-react'
import { CreatePixelModal } from '../components/create-pixel-modal'

interface Pixel {
     id: string
     name: string
     platform: string
     conversions: number
     lastConversion: string
     status: 'active' | 'inactive'
     createdAt: string
}

export default function PixelTracker() {
     const [searchQuery, setSearchQuery] = useState('')
     const [showInactive, setShowInactive] = useState(false)
     const [showCreateModal, setShowCreateModal] = useState(false)
     const [showReportModal, setShowReportModal] = useState(false)
     const [selectedPixelForReport, setSelectedPixelForReport] = useState<Pixel | null>(null)
     const [showDashboardModal, setShowDashboardModal] = useState(false)
     const [selectedPixelForDashboard, setSelectedPixelForDashboard] = useState<Pixel | null>(null)
     const [showReduceEscapeModal, setShowReduceEscapeModal] = useState(false)
     const [selectedPixelForEscape, setSelectedPixelForEscape] = useState<Pixel | null>(null)
     const [showIpBlockerModal, setShowIpBlockerModal] = useState(false)
     const [selectedPixelForIpBlocker, setSelectedPixelForIpBlocker] = useState<Pixel | null>(null)
     const [ipBlockerActiveTab, setIpBlockerActiveTab] = useState('current')
     const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
     const [editingPixelId, setEditingPixelId] = useState<string | null>(null)
     const [pixels, setPixels] = useState<Pixel[]>([
          {
               id: '1',
               name: 'Hotmart - Produto Digital Pro',
               platform: 'Hotmart',
               conversions: 156,
               lastConversion: '2 horas atrás',
               status: 'active',
               createdAt: '15/10/2024'
          },
          {
               id: '2',
               name: 'Braip - Curso Online Master',
               platform: 'Braip',
               conversions: 89,
               lastConversion: '5 horas atrás',
               status: 'active',
               createdAt: '20/10/2024'
          },
          {
               id: '3',
               name: 'Monetizze - Ebook Premium',
               platform: 'Monetizze',
               conversions: 0,
               lastConversion: 'Nunca',
               status: 'inactive',
               createdAt: '05/09/2024'
          },
          {
               id: '4',
               name: 'Eduzz - Mentoria VIP',
               platform: 'Eduzz',
               conversions: 234,
               lastConversion: '30 minutos atrás',
               status: 'active',
               createdAt: '12/11/2024'
          }
     ])

     const filteredPixels = pixels.filter(pixel => {
          const matchesSearch = pixel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              pixel.platform.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesStatus = showInactive ? pixel.status === 'inactive' : pixel.status === 'active'
          return matchesSearch && matchesStatus
     })

     // Fechar dropdown ao clicar fora
     useEffect(() => {
          function handleClickOutside(event: MouseEvent) {
               if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
                    setOpenDropdownId(null)
               }
          }

          document.addEventListener('mousedown', handleClickOutside)
          return () => {
               document.removeEventListener('mousedown', handleClickOutside)
          }
     }, [openDropdownId])

     // Função para copiar código do pixel
     const handleCopyPixelCode = (pixelId: string) => {
          const code = `<!-- Start HubFi tracking (hubfi.minify.js) -->
    <!-- Place at the end of the head and before the </head> tag -->
    <script data-render-head="true" src="https://static.hubfi.io/hubfi.minify.js?pixelId=${pixelId}"></script>
    <!-- End HubFi tracking (hubfi.minify.js) -->`
          
          navigator.clipboard.writeText(code).then(() => {
               // Aqui poderia mostrar uma notificação de sucesso
               console.log('Código copiado para a área de transferência!')
          }).catch((err) => {
               console.error('Erro ao copiar código:', err)
          })
          
          setOpenDropdownId(null) // Fechar dropdown após copiar
     }

     // Função para abrir relatórios
     const handleOpenReport = (pixel: Pixel) => {
          setSelectedPixelForReport(pixel)
          setShowReportModal(true)
          setOpenDropdownId(null)
     }

     // Função para abrir dashboard
     const handleOpenDashboard = (pixel: Pixel) => {
          setSelectedPixelForDashboard(pixel)
          setShowDashboardModal(true)
          setOpenDropdownId(null)
     }

     // Função para abrir reduzir fuga
     const handleOpenReduceEscape = (pixel: Pixel) => {
          setSelectedPixelForEscape(pixel)
          setShowReduceEscapeModal(true)
          setOpenDropdownId(null)
     }

     // Função para abrir bloqueador de IPs
     const handleOpenIpBlocker = (pixel: Pixel) => {
          setSelectedPixelForIpBlocker(pixel)
          setShowIpBlockerModal(true)
          setOpenDropdownId(null)
     }

     // Dados mock para o relatório
     const reportData = [
          { date: '09/12/2025', visits: 1, uniqueVisits: '1 (100%)', cleanVisits: '1 (100%)', trafficVisits: '0 (0%)', productorPassage: '0 (0%)', escapeRate: '0%', checkouts: '0 (0%)', totalSales: '0 (0%)', blockedIPs: 0 },
          { date: '08/12/2025', visits: 1, uniqueVisits: '1 (100%)', cleanVisits: '0 (0%)', trafficVisits: '0 (0%)', productorPassage: '0 (0%)', escapeRate: '0%', checkouts: '0 (0%)', totalSales: '0 (0%)', blockedIPs: 0 },
          { date: '07/12/2025', visits: 2, uniqueVisits: '2 (100%)', cleanVisits: '1 (50%)', trafficVisits: '0 (0%)', productorPassage: '0 (0%)', escapeRate: '0%', checkouts: '0 (0%)', totalSales: '0 (0%)', blockedIPs: 0 },
          { date: '05/12/2025', visits: 1, uniqueVisits: '1 (100%)', cleanVisits: '0 (0%)', trafficVisits: '0 (0%)', productorPassage: '0 (0%)', escapeRate: '0%', checkouts: '0 (0%)', totalSales: '0 (0%)', blockedIPs: 0 },
          { date: '04/12/2025', visits: 3, uniqueVisits: '2 (67%)', cleanVisits: '1 (50%)', trafficVisits: '1 (100%)', productorPassage: '1 (100%)', escapeRate: '0%', checkouts: '0 (0%)', totalSales: '0 (0%)', blockedIPs: 0 },
          { date: '03/12/2025', visits: 4, uniqueVisits: '4 (100%)', cleanVisits: '3 (75%)', trafficVisits: '1 (33%)', productorPassage: '1 (100%)', escapeRate: '0%', checkouts: '0 (0%)', totalSales: '0 (0%)', blockedIPs: 0 }
     ]

     return (
          <div className="min-h-screen p-8">
               <div className="mb-8">
                    <h1 className="text-headline mb-2">Pixel Tracker</h1>
                    <p className="text-body-muted">
                         Gerencie e monitore seus pixels de conversão
                    </p>
               </div>

               {/* Barra de busca e ações */}
               <div className="mb-6 flex flex-col md:flex-row gap-4">
                    {/* Input de busca */}
                    <div className="relative flex-1">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                         <input
                              type="text"
                              placeholder="Buscar pixels por nome ou plataforma..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-border bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                         />
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3">
                         {/* Filtro de pixels inativos */}
                         <button
                              onClick={() => setShowInactive(!showInactive)}
                              className={`flex items-center gap-2 px-4 py-2 border border-border rounded-md transition-colors ${
                                   showInactive ? 'bg-accent text-foreground' : 'bg-card hover:bg-accent text-foreground'
                              }`}
                         >
                              <Filter className="w-4 h-4" />
                              <span className="text-body">{showInactive ? 'Mostrar ativos' : 'Mostrar inativos'}</span>
                         </button>

                         {/* Botão criar pixel */}
                         <button 
                              onClick={() => setShowCreateModal(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-white hover:opacity-90 rounded-md transition-colors"
                         >
                              <Plus className="w-4 h-4 text-black"/>
                              <span className="text-body text-black">Criar Pixel</span>
                         </button>
                    </div>
               </div>

               {/* Lista de pixels */}
               {filteredPixels.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         {filteredPixels.map((pixel) => (
                              <div
                                   key={pixel.id}
                                   className="bg-card border border-border rounded-md p-6 hover:shadow-md transition-shadow"
                              >
                                   <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                             <div className="flex items-center gap-3 mb-2">
                                                  <div className="flex items-center gap-2 group">
                                                       {editingPixelId === pixel.id ? (
                                                            <input
                                                                 type="text"
                                                                 defaultValue={pixel.name}
                                                                 className="text-title bg-card border-b-2 border-primary outline-none px-1"
                                                                 autoFocus
                                                                 onBlur={() => setEditingPixelId(null)}
                                                                 onKeyDown={(e) => {
                                                                      if (e.key === 'Escape' || e.key === 'Enter') {
                                                                           setEditingPixelId(null)
                                                                      }
                                                                 }}
                                                            />
                                                       ) : (
                                                            <>
                                                                 <h3 className="text-title">{pixel.name}</h3>
                                                                 <button 
                                                                      onClick={() => setEditingPixelId(pixel.id)}
                                                                      className="p-1 hover:bg-accent rounded transition-colors"
                                                                      title="Editar nome"
                                                                 >
                                                                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                                 </button>
                                                            </>
                                                       )}
                                                  </div>
                                                  <span
                                                       className={`flex items-center gap-1 px-2 py-1 rounded-full text-label ${
                                                            pixel.status === 'active'
                                                                 ? 'bg-success/10 text-success'
                                                                 : 'bg-destructive/10 text-destructive'
                                                       }`}
                                                  >
                                                       {pixel.status === 'active' ? (
                                                            <>
                                                                 <Activity className="w-3 h-3" />
                                                                 Ativo
                                                            </>
                                                       ) : (
                                                            <>
                                                                 <EyeOff className="w-3 h-3" />
                                                                 Inativo
                                                            </>
                                                       )}
                                                  </span>
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                  <div>
                                                       <p className="text-label text-muted-foreground mb-1">Plataforma</p>
                                                       <p className="text-body">{pixel.platform}</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-label text-muted-foreground mb-1">Conversões</p>
                                                       <p className="text-body font-semibold">{pixel.conversions}</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-label text-muted-foreground mb-1">Última conversão</p>
                                                       <p className="text-body">{pixel.lastConversion}</p>
                                                  </div>
                                                  <div>
                                                       <p className="text-label text-muted-foreground mb-1">Criado em</p>
                                                       <p className="text-body">{pixel.createdAt}</p>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Menu de ações */}
                                        <div className="relative dropdown-container">
                                             <button 
                                                  onClick={() => setOpenDropdownId(openDropdownId === pixel.id ? null : pixel.id)}
                                                  className="p-2 hover:bg-accent rounded-md transition-colors"
                                             >
                                                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                             </button>
                                             
                                             {/* Dropdown menu */}
                                             {openDropdownId === pixel.id && (
                                                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-10">
                                                       <button 
                                                            onClick={() => handleCopyPixelCode(pixel.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left"
                                                       >
                                                            <Copy className="w-4 h-4" />
                                                            <span className="text-body">Copiar código</span>
                                                       </button>
                                                       <button className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left">
                                                            <TestTube className="w-4 h-4" />
                                                            <span className="text-body">Testar instalação</span>
                                                       </button>
                                                       <button 
                                                            onClick={() => handleOpenReport(pixel)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left"
                                                       >
                                                            <FileText className="w-4 h-4" />
                                                            <span className="text-body">Relatórios</span>
                                                       </button>
                                                       <button 
                                                            onClick={() => handleOpenDashboard(pixel)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left"
                                                       >
                                                            <LayoutDashboard className="w-4 h-4" />
                                                            <span className="text-body">Dashboard</span>
                                                       </button>
                                                       <button 
                                                            onClick={() => handleOpenIpBlocker(pixel)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left"
                                                       >
                                                            <Shield className="w-4 h-4" />
                                                            <span className="text-body">Bloqueador de IPs</span>
                                                       </button>
                                                       <button 
                                                            onClick={() => handleOpenReduceEscape(pixel)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left"
                                                       >
                                                            <Zap className="w-4 h-4" />
                                                            <span className="text-body">Reduzir fuga</span>
                                                       </button>
                                                       <button className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent transition-colors text-left border-t border-border">
                                                            <ShoppingCart className="w-4 h-4" />
                                                            <span className="text-body">Configurar checkout</span>
                                                       </button>
                                                       <button className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors text-left border-t border-border">
                                                            <EyeOff className="w-4 h-4" />
                                                            <span className="text-body">Desativar pixel</span>
                                                       </button>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               ) : (
                    <div className="bg-card border border-border rounded-md p-12 text-center">
                         <p className="text-body text-muted-foreground mb-4">
                              Nenhum pixel encontrado
                         </p>
                         <button 
                              onClick={() => setShowCreateModal(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-black hover:bg-accent/80 rounded-md transition-colors"
                         >
                              <Plus className="w-4 h-4" />
                              <span>Criar primeiro pixel</span>
                         </button>
                    </div>
               )}

               {/* Modal de criar pixel */}
               {showCreateModal && (
                    <CreatePixelModal 
                         onClose={() => setShowCreateModal(false)}
                    />
               )}

               {/* Modal de relatórios */}
               {showReportModal && selectedPixelForReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                         {/* Overlay */}
                         <div 
                              className="absolute inset-0 bg-black/50"
                              onClick={() => setShowReportModal(false)}
                         />
                         
                         {/* Modal */}
                         <div className="relative bg-card border border-border rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
                              {/* Header */}
                              <div className="flex items-center justify-between p-6 border-b border-border">
                                   <div>
                                        <h2 className="text-headline">Relatório Funil</h2>
                                        <p className="text-body text-muted-foreground">
                                             <span className="text-blue-500">{selectedPixelForReport.name}</span> - 14/11/2025
                                        </p>
                                   </div>
                                   <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-md hover:bg-success/80 transition-colors">
                                             <FileText className="w-4 h-4" />
                                             Exportar relatório de Funil completo
                                        </button>
                                        <button 
                                             onClick={() => setShowReportModal(false)}
                                             className="p-2 hover:bg-accent rounded-md transition-colors"
                                        >
                                             <X className="w-5 h-5" />
                                        </button>
                                   </div>
                              </div>

                              {/* Conteúdo da tabela */}
                              <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                                   <div className="overflow-x-auto">
                                        <table className="w-full min-w-[1400px]">
                                             <thead>
                                                  <tr className="border-b border-border">
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[90px]">DATA</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[80px]">VISITAS?</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[120px]">VISITAS ÚNICAS?</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[120px]">VISITAS LIMPAS?</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[140px]">VISITAS DE TRÁFEGO PAGO</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[140px]">PASSAGEM PARA O PRODUTOR</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[100px]">TAXA DE FUGA</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[100px]">CHECKOUTS</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[120px]">TOTAL DE VENDAS?</th>
                                                       <th className="text-left py-3 px-2 text-label font-semibold text-muted-foreground min-w-[60px]">IPS BLOQUEADOS</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {reportData.map((row, index) => (
                                                       <tr key={index} className={index % 2 === 0 ? 'bg-accent/30' : 'bg-transparent'}>
                                                            <td className="py-3 px-2 text-body min-w-[90px]">{row.date}</td>
                                                            <td className="py-3 px-2 text-body min-w-[80px]">{row.visits}</td>
                                                            <td className="py-3 px-2 text-body min-w-[120px]">{row.uniqueVisits}</td>
                                                            <td className="py-3 px-2 text-body min-w-[120px]">{row.cleanVisits}</td>
                                                            <td className="py-3 px-2 text-body min-w-[140px]">
                                                                 <div className="flex items-center gap-1">
                                                                      {row.trafficVisits}
                                                                      {row.trafficVisits !== '0 (0%)' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                                                                 </div>
                                                            </td>
                                                            <td className="py-3 px-2 text-body min-w-[140px]">
                                                                 <div className="flex items-center gap-1">
                                                                      {row.productorPassage}
                                                                      {row.productorPassage !== '0 (0%)' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                                                                 </div>
                                                            </td>
                                                            <td className="py-3 px-2 text-body min-w-[100px]">{row.escapeRate}</td>
                                                            <td className="py-3 px-2 text-body min-w-[100px]">
                                                                 <div className="flex items-center gap-1">
                                                                      {row.checkouts}
                                                                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                                 </div>
                                                            </td>
                                                            <td className="py-3 px-2 text-body min-w-[120px]">
                                                                 <div className="flex items-center gap-1">
                                                                      {row.totalSales}
                                                                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                                 </div>
                                                            </td>
                                                            <td className="py-3 px-2 text-body text-center min-w-[60px]">{row.blockedIPs}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>

                                   {/* Paginação */}
                                   <div className="flex justify-center items-center gap-2 mt-6">
                                        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-accent text-foreground rounded-md transition-colors disabled:opacity-50">
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                             </svg>
                                             Anterior
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                             <button className="w-8 h-8 flex items-center justify-center bg-foreground text-background rounded-md text-sm font-medium">
                                                  1
                                             </button>
                                             <button className="w-8 h-8 flex items-center justify-center hover:bg-accent text-foreground rounded-md text-sm transition-colors">
                                                  2
                                             </button>
                                             <button className="w-8 h-8 flex items-center justify-center hover:bg-accent text-foreground rounded-md text-sm transition-colors">
                                                  3
                                             </button>
                                             <span className="px-2 text-muted-foreground">...</span>
                                             <button className="w-8 h-8 flex items-center justify-center hover:bg-accent text-foreground rounded-md text-sm transition-colors">
                                                  10
                                             </button>
                                        </div>

                                        <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-accent text-foreground rounded-md transition-colors">
                                             Próxima
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                             </svg>
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Modal de dashboard */}
               {showDashboardModal && selectedPixelForDashboard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                         {/* Overlay */}
                         <div 
                              className="absolute inset-0 bg-black/50"
                              onClick={() => setShowDashboardModal(false)}
                         />
                         
                         {/* Modal */}
                         <div className="relative bg-card border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                              {/* Header */}
                              <div className="flex items-center justify-between p-6 border-b border-border">
                                   <h2 className="text-headline">Dashboard</h2>
                                   <button 
                                        onClick={() => setShowDashboardModal(false)}
                                        className="p-2 hover:bg-accent rounded-md transition-colors"
                                   >
                                        <X className="w-5 h-5" />
                                   </button>
                              </div>

                              <div className="p-6">
                                   {/* Filtro de Data */}
                                   <div className="mb-8">
                                        <h3 className="text-title mb-4">Filtro de Data</h3>
                                        <div className="bg-card border border-border rounded-md p-6">
                                             <div className="mb-6">
                                                  <label className="block text-label text-muted-foreground mb-3">Atalhos:</label>
                                                  <div className="flex gap-2 flex-wrap">
                                                       <button className="px-4 py-2 bg-card border border-border rounded-md text-body hover:bg-accent transition-colors">Hoje</button>
                                                       <button className="px-4 py-2 bg-card border border-border rounded-md text-body hover:bg-accent transition-colors">Ontem</button>
                                                       <button className="px-4 py-2 bg-card border border-border rounded-md text-body hover:bg-accent transition-colors">7 dias</button>
                                                       <button className="px-4 py-2 bg-card border border-border rounded-md text-body hover:bg-accent transition-colors">30 dias</button>
                                                       <button className="px-4 py-2 bg-foreground text-background rounded-md text-body">Tudo</button>
                                                  </div>
                                             </div>
                                             
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                  <div>
                                                       <label className="block text-label text-muted-foreground mb-2">Data inicial:</label>
                                                       <input type="date" className="w-full px-4 py-2 border border-border bg-card rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                                  </div>
                                                  <div>
                                                       <label className="block text-label text-muted-foreground mb-2">Data final:</label>
                                                       <input type="date" className="w-full px-4 py-2 border border-border bg-card rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                                                  </div>
                                             </div>
                                             
                                             <button className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors">
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                  </svg>
                                                  Atualizar
                                             </button>
                                        </div>
                                   </div>

                                   {/* Informações do Pixel */}
                                   <div className="mb-8">
                                        <div className="bg-accent/30 border border-border rounded-md p-6">
                                             <div className="flex items-center gap-3 mb-4">
                                                  <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center">
                                                       <span className="text-sm font-bold">i</span>
                                                  </div>
                                                  <h4 className="text-title">Informações do HubFi</h4>
                                             </div>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body">
                                                  <p><span className="font-medium text-foreground">Plataforma:</span> <span className="text-muted-foreground">Hotmart</span></p>
                                                  <p><span className="font-medium text-foreground">Conta:</span> <span className="text-muted-foreground">890-556-8550</span></p>
                                                  <p><span className="font-medium text-foreground">Pixel:</span> <span className="text-muted-foreground">{selectedPixelForDashboard.name} - 14/11/2025</span></p>
                                                  <p><span className="font-medium text-foreground">Página:</span> <span className="text-muted-foreground">https://theofficialportal.store/theofici...</span></p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Período Selecionado */}
                                   <div className="mb-8">
                                        <p className="text-body">
                                             <span className="font-medium text-foreground">Período selecionado:</span> <span className="text-muted-foreground">Todos os dados disponíveis</span>
                                        </p>
                                   </div>

                                   {/* Funil de Conversão */}
                                   <div className="mb-8">
                                        <h3 className="text-title mb-6">Funil de Conversão</h3>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-2">170</div>
                                                  <div className="text-label text-muted-foreground font-medium">Total de visitas</div>
                                             </div>
                                             
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-1">102</div>
                                                  <div className="text-label text-muted-foreground font-medium mb-1">Visitas únicas</div>
                                                  <div className="text-label text-muted-foreground">60.0%</div>
                                             </div>
                                             
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-1">75</div>
                                                  <div className="text-label text-muted-foreground font-medium mb-1">Visitas limpas</div>
                                                  <div className="text-label text-muted-foreground">73.5%</div>
                                             </div>
                                             
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-1">51</div>
                                                  <div className="text-label text-muted-foreground font-medium mb-1">Visitas tráfego pago</div>
                                                  <div className="text-label text-muted-foreground">68.0%</div>
                                             </div>
                                             
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-1">22</div>
                                                  <div className="text-label text-muted-foreground font-medium mb-1">Checkouts</div>
                                                  <div className="text-label text-muted-foreground">43.1%</div>
                                             </div>
                                             
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-1">10</div>
                                                  <div className="text-label text-muted-foreground font-medium mb-1">Vendas</div>
                                                  <div className="text-label text-muted-foreground">45.5%</div>
                                             </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-1">50</div>
                                                  <div className="text-label text-muted-foreground font-medium mb-1">Cliques na sua página</div>
                                                  <div className="text-label text-muted-foreground">98.0%</div>
                                             </div>
                                             
                                             <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                                  <div className="text-3xl font-bold text-foreground mb-2">2.0%</div>
                                                  <div className="text-label text-muted-foreground font-medium">Taxa de Fuga</div>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Informações Adicionais */}
                                   <div>
                                        <h3 className="text-title mb-6">Informações Adicionais</h3>
                                        <div className="bg-card border border-border rounded-md p-6 text-center hover:shadow-sm transition-shadow">
                                             <div className="text-3xl font-bold text-foreground mb-2">0</div>
                                             <div className="text-label text-muted-foreground font-medium">IPs Bloqueados</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Modal de reduzir fuga */}
               {showReduceEscapeModal && selectedPixelForEscape && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                         {/* Overlay */}
                         <div 
                              className="absolute inset-0 bg-black/50"
                              onClick={() => setShowReduceEscapeModal(false)}
                         />
                         
                         {/* Modal */}
                         <div className="relative bg-card border border-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                              {/* Header */}
                              <div className="flex items-center justify-between p-6 border-b border-border">
                                   <h2 className="text-headline">Reduzir Fuga</h2>
                                   <button 
                                        onClick={() => setShowReduceEscapeModal(false)}
                                        className="p-2 hover:bg-accent rounded-md transition-colors"
                                   >
                                        <X className="w-5 h-5" />
                                   </button>
                              </div>

                              <div className="p-6 space-y-6">
                                   {/* Introdução */}
                                   <div>
                                        <h3 className="text-title mb-3">Funcionalidade que reduz fugas na sua presell</h3>
                                        <div className="space-y-3 text-body text-muted-foreground">
                                             <p>Detecta quando o cliente clica no anúncio e redireciona automaticamente para o produtor.</p>
                                             <p>Aumenta suas chances de finalizar mais checkouts e vendas.</p>
                                        </div>
                                   </div>

                                   {/* Link do afiliado */}
                                   <div>
                                        <label className="block text-body font-semibold mb-2">Cole aqui o seu link de afiliado</label>
                                        <input
                                             type="url"
                                             placeholder="https://exemplo.com/afiliado"
                                             className="w-full px-4 py-2 border border-border bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                   </div>

                                   {/* Tempo de redirecionamento */}
                                   <div>
                                        <label className="block text-body font-semibold mb-2">Quantos segundos após a visita o cliente deverá ser redirecionado?</label>
                                        <p className="text-body text-muted-foreground mb-3">Recomendamos 5 segundos para uma transição suave e aumentar suas chances de conversão.</p>
                                        <select className="w-full px-4 py-2 border border-border bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                             <option value="5">5 segundos</option>
                                             <option value="3">3 segundos</option>
                                             <option value="7">7 segundos</option>
                                             <option value="10">10 segundos</option>
                                        </select>
                                   </div>

                                   {/* Switch de redirecionamento */}
                                   <div>
                                        <h4 className="text-body font-semibold mb-3">Redirecionar para a página do produtor quando o cliente tentar fechar a página?</h4>
                                        <p className="text-body text-muted-foreground mb-3">Ative para reduzir ainda mais as fugas!</p>
                                        
                                        <label className="flex items-center justify-between p-4 bg-accent/30 border border-border rounded-md cursor-pointer">
                                             <span className="text-body">Ativar redirecionamento automático</span>
                                             <input type="checkbox" className="sr-only peer" />
                                             <div className="relative w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground shrink-0"></div>
                                        </label>
                                   </div>

                                   {/* Aviso */}
                                   <div className="bg-accent/30 border border-border rounded-md p-4">
                                        <h4 className="text-body font-semibold mb-2">Atenção:</h4>
                                        <div className="space-y-2 text-body text-muted-foreground">
                                             <p>Ao ativar o redirecionamento automático (presell fantasma), você está ciente de que esta prática não está de acordo com as políticas do Google.</p>
                                             <p>Esta funcionalidade pode resultar em restrições ou até na suspensão da sua conta.</p>
                                        </div>
                                        
                                        <label className="flex items-center justify-between mt-4 p-3 bg-card border border-border rounded-md cursor-pointer">
                                             <span className="text-body">Usar com responsabilidade e conforme sua estratégia de risco</span>
                                             <input type="checkbox" className="sr-only peer" />
                                             <div className="relative w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground shrink-0"></div>
                                        </label>
                                        
                                        <p className="text-body text-muted-foreground mt-2">Não nos responsabilizamos por eventuais suspensões de contas junto ao Google.</p>
                                   </div>

                                   {/* Botões de ação */}
                                   <div className="flex justify-end gap-3">
                                        <button 
                                             onClick={() => setShowReduceEscapeModal(false)}
                                             className="px-6 py-2 border border-border bg-card hover:bg-accent text-foreground rounded-md transition-colors"
                                        >
                                             Cancelar
                                        </button>
                                        <button 
                                             disabled 
                                             className="px-6 py-2 bg-card border border-border text-muted-foreground rounded-md cursor-not-allowed opacity-50"
                                        >
                                             Desligar redirecionador
                                        </button>
                                        <button className="px-6 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors">
                                             Salvar
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Modal de bloqueador de IPs */}
               {showIpBlockerModal && selectedPixelForIpBlocker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                         {/* Overlay */}
                         <div 
                              className="absolute inset-0 bg-black/50"
                              onClick={() => setShowIpBlockerModal(false)}
                         />
                         
                         {/* Modal */}
                         <div className="relative bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                              {/* Header com logo do Google Ads */}
                              <div className="flex items-center justify-between p-6 border-b border-border">
                                   <div className="flex items-center gap-3">
                                        <h2 className="text-headline">Bloqueador automático de IPs</h2>
                                   </div>
                                   <button 
                                        onClick={() => setShowIpBlockerModal(false)}
                                        className="p-2 hover:bg-accent rounded-md transition-colors"
                                   >
                                        <X className="w-5 h-5" />
                                   </button>
                              </div>

                              <div className="p-6">
                                   {/* Abas */}
                                   <div className="flex mb-6">
                                        <button 
                                             onClick={() => setIpBlockerActiveTab('current')}
                                             className={`px-4 py-2 ${ipBlockerActiveTab === 'current' ? 'border-b-2 border-foreground text-foreground font-medium' : 'text-blue-500 hover:text-blue-600'} transition-colors`}
                                        >
                                             Configuração atual
                                        </button>
                                        <button 
                                             onClick={() => setIpBlockerActiveTab('configure')}
                                             className={`px-4 py-2 ${ipBlockerActiveTab === 'configure' ? 'border-b-2 border-foreground text-foreground font-medium' : 'text-blue-500 hover:text-blue-600'} transition-colors`}
                                        >
                                             Configure o bloqueador de IP
                                        </button>
                                   </div>

                                   {/* Conteúdo da aba atual */}
                                   {ipBlockerActiveTab === 'current' ? (
                                        <div className="text-center py-8">
                                             <div className="bg-accent/30 border border-border rounded-md p-8">
                                                  <h3 className="text-title mb-4">Nenhuma configuração ativa</h3>
                                                  <p className="text-body text-muted-foreground mb-6">
                                                       Você ainda não configurou o bloqueador automático de IPs. 
                                                       Configure agora para começar a bloquear IPs suspeitos automaticamente.
                                                  </p>
                                                  <button 
                                                       onClick={() => setIpBlockerActiveTab('configure')}
                                                       className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors"
                                                  >
                                                       Configurar agora
                                                  </button>
                                             </div>
                                        </div>
                                   ) : (
                                        <div className="space-y-6">
                                             {/* Suas contas do Google ADS */}
                                             <div>
                                                  <div className="flex items-center gap-2 mb-2">
                                                       <label className="block text-body font-medium">Suas contas do Google ADS (menos a(s) conta(s) MCC)</label>
                                                       <div className="w-4 h-4 bg-muted-foreground rounded-full flex items-center justify-center cursor-help">
                                                            <span className="text-white text-xs">?</span>
                                                       </div>
                                                  </div>
                                                  <select className="w-full px-4 py-2 border border-border bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                                       <option value="">Sua conta do Google ADS</option>
                                                       <option value="account1">Conta ADS 1 - 123-456-7890</option>
                                                       <option value="account2">Conta ADS 2 - 987-654-3210</option>
                                                  </select>
                                             </div>

                                             {/* Suas campanhas do Google ADS */}
                                             <div>
                                                  <label className="block text-body font-medium mb-2">Suas campanhas do Google ADS</label>
                                                  <select className="w-full px-4 py-2 border border-border bg-card text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                                       <option value="">Selecione uma campanha</option>
                                                       <option value="campaign1">Campanha Produto Digital</option>
                                                       <option value="campaign2">Campanha Black Friday</option>
                                                  </select>
                                             </div>

                                             {/* Switch de configuração avançada */}
                                             <div>
                                                  <label className="flex items-center justify-between p-4 bg-accent/30 border border-border rounded-md cursor-pointer">
                                                       <div>
                                                            <span className="text-body font-medium">Usar configuração avançada para bloqueio de Bot?</span>
                                                       </div>
                                                       <input type="checkbox" className="sr-only peer" />
                                                       <div className="relative w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground shrink-0"></div>
                                                  </label>
                                             </div>

                                             {/* Aviso do Google */}
                                             <div className="bg-accent/30 border border-border rounded-md p-4">
                                                  <p className="text-body text-muted-foreground">
                                                       <span className="font-medium">Atenção:</span> O Google ADS <span className="font-medium">limita a 500 ips bloqueados por campanha.</span>
                                                  </p>
                                             </div>

                                             {/* Botão Salvar */}
                                             <div className="pt-4">
                                                  <button className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-colors">
                                                       Salvar
                                                  </button>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               )}
          </div>
     )
}