import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Plus, 
  Target, 
  DollarSign, 
  Users, 
  Search, 
  MoreVertical,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export function SalesPanel() {
  const [activeTab, setActiveTab] = useState('management');
  const [sales, setSales] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Form states
  const [newSale, setNewSale] = useState({ client_id: '', service_id: '', value: '' });
  const [newGoalValue, setNewGoalValue] = useState('');
  const [newLead, setNewLead] = useState({ nome_empresa: '', email: '', telefone: '', origem: '', tags: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, goalRes, stagesRes, leadsRes, clientsRes, servicesRes] = await Promise.all([
        api.get('/sales/sales/'),
        api.get('/sales/goals/current'),
        api.get('/sales/funnel/stages'),
        api.get('/sales/funnel/leads'),
        api.get('/clients/'),
        api.get('/services/')
      ]);
      setSales(salesRes.data);
      setGoal(goalRes.data);
      setStages(stagesRes.data);
      setLeads(leadsRes.data);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Erro ao carregar dados de vendas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async () => {
    try {
      await api.post('/sales/sales/', {
        ...newSale,
        value: parseFloat(newSale.value)
      });
      toast.success('Venda registrada e integrada ao financeiro!');
      setIsSaleModalOpen(false);
      setNewSale({ client_id: '', service_id: '', value: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao registrar venda');
    }
  };

  const handleUpdateGoal = async () => {
    try {
      const today = new Date();
      await api.post('/sales/goals/', {
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        target_value: parseFloat(newGoalValue)
      });
      toast.success('Meta mensal atualizada!');
      setIsGoalModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar meta');
    }
  };

  const handleCreateLead = async () => {
    try {
      await api.post('/sales/funnel/leads', newLead);
      toast.success('Lead cadastrado no funil!');
      setIsLeadModalOpen(false);
      setNewLead({ nome_empresa: '', email: '', telefone: '', origem: '', tags: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao cadastrar lead');
    }
  };

  const handleMoveLead = async (leadId: string, stageId: string) => {
    try {
      await api.patch(`/sales/funnel/leads/${leadId}/stage`, { stage_id: stageId });
      toast.success('Lead movimentado no funil');
      fetchData();
    } catch (error) {
      toast.error('Erro ao movimentar lead');
    }
  };

  const currentTotal = sales.reduce((acc, s) => acc + s.value, 0);
  const goalProgress = goal ? (currentTotal / goal.target_value) * 100 : 0;

  if (loading && sales.length === 0) {
    return <div className="p-20 text-center font-black text-primary uppercase animate-pulse">Carregando Módulo de Vendas...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-primary tracking-tighter">Módulo de Vendas</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 italic">Gestão de metas e funil de conversão CRM</p>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={() => setIsLeadModalOpen(true)} variant="outline" className="border-2 border-primary/20 font-bold uppercase tracking-widest text-[10px]">
             <Users className="h-4 w-4 mr-2" /> Novo Lead
           </Button>
           <Button onClick={() => setIsSaleModalOpen(true)} className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 text-white">
             <Plus className="h-4 w-4 mr-2" /> Registrar Venda
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border-2 border-primary h-auto p-0 rounded-none overflow-hidden">
          <TabsTrigger value="management" className="flex-1 uppercase font-black text-[10px] tracking-widest py-4 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-none border-r-2 border-primary last:border-0">
             <TrendingUp className="h-4 w-4 mr-2" /> Gestão & Metas
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex-1 uppercase font-black text-[10px] tracking-widest py-4 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-none">
             <Target className="h-4 w-4 mr-2" /> Funil de CRM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-8 space-y-8">
          {/* Goal Progress */}
          <Card className="border-4 border-primary rounded-none shadow-[8px_8px_0px_0px_rgba(6,36,100,0.1)] overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-primary/40 flex items-center gap-2">
                     <Target className="h-4 w-4" /> Meta Coletiva Mensal
                   </h3>
                   <div className="text-4xl font-black text-primary mt-1 italic uppercase tracking-tighter">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal)}
                     <span className="text-xl text-primary/20 ml-2">/ {goal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_value) : 'R$ 0,00'}</span>
                   </div>
                </div>
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors" onClick={() => {
                  setNewGoalValue(goal?.target_value?.toString() || '');
                  setIsGoalModalOpen(true);
                }}>
                   Ajustar Meta
                </Button>
              </div>
              
              <div className="h-10 w-full bg-slate-100 border-2 border-primary flex overflow-hidden relative">
                 <div 
                   className="h-full bg-[#00c853] transition-all duration-1000 ease-out flex items-center justify-end px-3 relative z-10" 
                   style={{ width: `${Math.min(goalProgress, 100)}%` }}
                 >
                    {goalProgress >= 10 && <span className="text-[10px] font-black text-white italic">{Math.round(goalProgress)}%</span>}
                 </div>
                 {goalProgress > 100 && (
                   <div 
                     className="h-full bg-yellow-400 absolute top-0 left-0 transition-all duration-1000 ease-out opacity-40 animate-pulse" 
                     style={{ width: `${Math.min(goalProgress - 100, 100)}%` }}
                   />
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                 <div className="p-6 bg-slate-50 border-2 border-primary/10">
                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Vendas este mês</p>
                    <p className="text-2xl font-black text-primary italic tracking-tight">{sales.length}</p>
                 </div>
                 <div className="p-6 bg-slate-50 border-2 border-primary/10">
                    <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Ticket Médio</p>
                    <p className="text-2xl font-black text-primary italic tracking-tight">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sales.length > 0 ? currentTotal / sales.length : 0)}
                    </p>
                 </div>
                 <div className="p-6 bg-[#00c853]/5 border-2 border-[#00c853]/20">
                    <p className="text-[9px] font-black text-[#00c853] uppercase tracking-widest mb-1">Status da Meta</p>
                    <p className="text-2xl font-black text-[#00c853] italic tracking-tight uppercase">
                      {goalProgress >= 100 ? 'ALCANÇADA!' : `FALTAM ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal ? Math.max(0, goal.target_value - currentTotal) : 0)}`}
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales Table */}
          <div className="space-y-4">
             <h3 className="text-xl font-black text-primary uppercase tracking-tighter flex items-center gap-2">
               <DollarSign className="h-5 w-5" /> Vendas Recentes
             </h3>
             <div className="bg-white border-2 border-primary rounded-none overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50 border-b-2 border-primary">
                    <TableRow>
                      <TableHead className="font-black text-[10px] text-primary uppercase tracking-widest p-4 text-center">Data</TableHead>
                      <TableHead className="font-black text-[10px] text-primary uppercase tracking-widest p-4">Cliente / Serviço</TableHead>
                      <TableHead className="font-black text-[10px] text-primary uppercase tracking-widest p-4">Valor</TableHead>
                      <TableHead className="font-black text-[10px] text-primary uppercase tracking-widest p-4 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-primary/20 font-bold uppercase tracking-widest">Nenhuma venda registrada este mês</TableCell>
                      </TableRow>
                    ) : (
                      sales.map(sale => (
                        <TableRow key={sale.id} className="border-b border-primary/10 hover:bg-slate-50 transition-colors">
                          <TableCell className="p-4 text-center">
                             <div className="text-[10px] font-black text-primary/60 uppercase">
                               {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                             </div>
                          </TableCell>
                          <TableCell className="p-4">
                             <div className="font-black text-primary uppercase tracking-tight">{sale.client?.name}</div>
                             <div className="text-[9px] font-bold text-primary/40 uppercase tracking-widest italic">{sale.service?.name}</div>
                          </TableCell>
                          <TableCell className="p-4">
                             <span className="font-black text-[#00c853] italic">
                               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.value)}
                             </span>
                          </TableCell>
                          <TableCell className="p-4 text-right">
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary/40 hover:text-primary">
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="mt-8">
           <div className="flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <h3 className="text-xl font-black text-primary uppercase tracking-tighter flex items-center gap-2">
                   <Target className="h-5 w-5" /> Quadro Kanban de Funil
                 </h3>
                 <div className="flex gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                      <Input placeholder="Filtrar leads..." className="h-10 text-xs border-2 border-primary/10 rounded-none w-64 bg-white pl-10" />
                    </div>
                    <Button variant="outline" className="border-2 border-primary/20 font-bold uppercase tracking-widest text-[10px] bg-white">
                       Config. Etapas
                    </Button>
                 </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 min-h-[600px] scrollbar-hide">
                 {stages.map(stage => {
                    const stageLeads = leads.filter(l => l.stage_id === stage.id);
                    return (
                      <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                         <div className="flex items-center justify-between p-4 bg-white border-b-4 border-primary shadow-sm">
                            <h4 className="font-black text-[11px] text-primary uppercase tracking-widest flex items-center gap-2">
                              {stage.name}
                              <Badge variant="outline" className="text-[9px] font-black border-primary/10 bg-slate-50">
                                {stageLeads.length}
                              </Badge>
                            </h4>
                         </div>

                         <div className="flex-1 space-y-4 p-2 bg-slate-100/30 border-2 border-dotted border-primary/10 min-h-[400px]">
                            {stageLeads.length === 0 ? (
                               <div className="h-full flex flex-col items-center justify-center opacity-10">
                                  <Target className="h-10 w-10 mb-2" />
                                  <span className="text-[8px] font-black uppercase tracking-widest">Aguardando Leads</span>
                               </div>
                            ) : (
                              stageLeads.map(lead => (
                                <Card key={lead.id} className="border-2 border-primary/5 hover:border-primary transition-all group cursor-move bg-white rounded-none shadow-sm hover:shadow-md">
                                   <CardContent className="p-4 space-y-4">
                                      <div className="flex justify-between items-start">
                                         <h5 className="font-black text-sm text-primary uppercase tracking-tight leading-tight group-hover:text-link transition-colors">
                                            {lead.nome_empresa}
                                         </h5>
                                         <Select onValueChange={(val) => handleMoveLead(lead.id, val)}>
                                           <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent shadow-none hover:bg-slate-100">
                                              <MoreVertical className="h-3 w-3" />
                                           </SelectTrigger>
                                           <SelectContent>
                                              <p className="text-[8px] font-black text-primary/40 p-2 uppercase tracking-widest border-b">Mover para:</p>
                                              {stages.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="text-[10px] uppercase font-bold">{s.name}</SelectItem>
                                              ))}
                                           </SelectContent>
                                         </Select>
                                      </div>
                                      
                                      <div className="space-y-2">
                                         <div className="text-[9px] font-bold text-primary/50 uppercase tracking-widest flex items-center gap-1.5">
                                           <Users className="h-3 w-3 text-primary/30" /> {lead.origem}
                                         </div>
                                         <div className="flex flex-wrap gap-1">
                                            {lead.tags?.split(',').map((tag: string) => (
                                              <Badge key={tag} className="text-[8px] bg-primary/5 text-primary/60 border-0 font-black uppercase">{tag.trim()}</Badge>
                                            ))}
                                         </div>
                                      </div>

                                      <div className="pt-3 border-t border-primary/5 flex items-center justify-between">
                                         <div className="flex items-center gap-1.5">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 border border-white flex items-center justify-center text-[7px] font-black uppercase text-primary">OP</div>
                                            <span className="text-[8px] font-black text-primary/40 uppercase">Vinculado</span>
                                         </div>
                                         <div className="flex items-center gap-1 text-[8px] font-black text-primary/20 uppercase">
                                           <Clock className="h-2 w-2" /> {new Date(lead.data_criacao).toLocaleDateString('pt-BR')}
                                         </div>
                                      </div>
                                   </CardContent>
                                </Card>
                              ))
                            )}
                         </div>
                      </div>
                    );
                 })}
                 
                 <Button variant="ghost" onClick={() => setIsLeadModalOpen(true)} className="flex-shrink-0 w-12 h-auto bg-slate-50 border-2 border-dashed border-primary/10 hover:border-primary/30 flex items-center justify-center rounded-none group min-h-[400px]">
                    <Plus className="h-5 w-5 text-primary/20 group-hover:text-primary transition-colors" />
                 </Button>
              </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Registrar Venda</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              A venda será vinculada ao financeiro como receita quitada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Cliente</Label>
              <Select onValueChange={(val) => setNewSale({...newSale, client_id: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Serviço</Label>
              <Select onValueChange={(val) => setNewSale({...newSale, service_id: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-value" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Valor da Venda (R$)</Label>
              <Input 
                id="sale-value" 
                type="number"
                placeholder="0.00" 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newSale.value}
                onChange={(e) => setNewSale({...newSale, value: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleCreateSale} className="bg-[#00c853] hover:bg-[#00c853]/90 text-white rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Confirmar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Ajustar Meta Mensal</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              Defina o objetivo de faturamento para o mês atual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-value" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Valor da Meta (R$)</Label>
              <Input 
                id="goal-value" 
                type="number"
                placeholder="0.00" 
                className="border-2 border-primary/10 font-bold rounded-none text-2xl h-14"
                value={newGoalValue}
                onChange={(e) => setNewGoalValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGoalModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleUpdateGoal} className="bg-primary hover:bg-primary/90 text-white rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Salvar Meta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Novo Lead (CRM)</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              Cadastre um lead diretamente no funil de vendas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Empresa / Nome</Label>
              <Input value={newLead.nome_empresa} onChange={(e) => setNewLead({...newLead, nome_empresa: e.target.value})} className="border-2 border-primary/10 font-bold rounded-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Email</Label>
                  <Input value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} className="border-2 border-primary/10 font-bold rounded-none" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Telefone</Label>
                  <Input value={newLead.telefone} onChange={(e) => setNewLead({...newLead, telefone: e.target.value})} className="border-2 border-primary/10 font-bold rounded-none" />
               </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Origem</Label>
              <Select onValueChange={(val) => setNewLead({...newLead, origem: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Como nos conheceu?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="Google">Google Search</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeadModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleCreateLead} className="bg-primary hover:bg-primary/90 text-white rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Criar Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
