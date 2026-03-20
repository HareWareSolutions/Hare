import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, FileText, Calendar, Edit2, Trash2, ShoppingCart, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PurchaseManager } from './PurchaseManager';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  is_paid: boolean;
  payment_method: string;
  invoice_issued: boolean;
  due_date: string;
  paid_at?: string;
  service_id?: string;
  client_id?: string;
  recurrence_id?: string;
}

interface Client { id: string; name: string; }
interface Service { id: string; name: string; type: string; }

export function FinancePanel() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'income',
    description: '',
    amount: '',
    payment_method: 'pix',
    invoice_issued: false,
    due_date: new Date().toISOString().split('T')[0],
    client_id: '',
    service_id: '',
    generate_future: false,
    recurrence_period: 'months',
    recurrence_duration: '6'
  });

  useEffect(() => {
    fetchData();
    fetchSupportData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/finance/');
      setTransactions(res.data);
    } catch (err) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('clients/'),
        api.get('services/')
      ]);
      setClients(cRes.data);
      setServices(sRes.data);
    } catch (err) {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/', {
        ...formData,
        amount: parseFloat(formData.amount),
        recurrence_duration: parseInt(formData.recurrence_duration),
        client_id: formData.client_id || null,
        service_id: formData.service_id || null
      });
      toast.success('Lançamento realizado com sucesso!');
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error('Erro ao realizar lançamento');
    }
  };

  const handleUpdateStatus = async (transaction: Transaction) => {
    try {
      await api.put(`finance/${transaction.id}`, { 
        is_paid: !transaction.is_paid,
        paid_at: !transaction.is_paid ? new Date().toISOString() : null
      });
      toast.success(`Status alterado para ${!transaction.is_paid ? 'PAGO' : 'PENDENTE'}`);
      fetchData();
    } catch (err) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    try {
      await api.delete(`finance/${id}`);
      toast.success('Lançamento excluído');
      fetchData();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      description: '',
      amount: '',
      payment_method: 'pix',
      invoice_issued: false,
      due_date: new Date().toISOString().split('T')[0],
      client_id: '',
      service_id: '',
      generate_future: false,
      recurrence_period: 'months',
      recurrence_duration: '6'
    });
  };

  const selectedService = services.find(s => s.id === formData.service_id);
  const isRecurringService = selectedService?.type === 'recurring';

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions.filter(t => t.type === 'income' && t.is_paid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense' && t.is_paid).reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = transactions.filter(t => !t.is_paid).reduce((acc, curr) => acc + (curr.type === 'income' ? curr.amount : -curr.amount), 0);
  const [activeTab, setActiveTab] = useState('cashflow');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-primary">Gestão Financeira</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-wider text-italic">Controle de entradas, saídas e solicitações</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 border-2 border-primary mb-6">
          <TabsTrigger value="cashflow" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[11px] tracking-widest px-8 py-2.5">
            <BarChart3 className="w-4 h-4 mr-2" /> Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[11px] tracking-widest px-8 py-2.5">
            <ShoppingCart className="w-4 h-4 mr-2" /> Gestão de Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cashflow" className="space-y-8 animate-in fade-in slide-in-from-left-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-accent hover:text-primary transition-all font-bold">
                  <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black italic uppercase text-primary">Novo Lançamento</DialogTitle>
                  <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">Informe os detalhes da transação financeira.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Tipo</Label>
                       <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="income">Entrada (Receita)</SelectItem>
                           <SelectItem value="expense">Saída (Despesa)</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Valor (R$)</Label>
                       <Input type="number" step="0.01" required value={formData.amount} onChange={e => {
                         const val = e.target.value === '' ? '' : e.target.value;
                         setFormData({...formData, amount: val});
                       }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Descrição</Label>
                    <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Pagamento Mensalidade" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Forma de Pagamento</Label>
                       <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="dinheiro">Dinheiro</SelectItem>
                           <SelectItem value="pix">PIX</SelectItem>
                           <SelectItem value="credito">Crédito</SelectItem>
                           <SelectItem value="debito">Débito</SelectItem>
                           <SelectItem value="boleto">Boleto</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Vencimento</Label>
                       <Input type="date" required value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Cliente (Opcional)</Label>
                       <Select value={formData.client_id} onValueChange={(val) => setFormData({...formData, client_id: val})}>
                         <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                         <SelectContent>
                           {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                         </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Serviço (Opcional)</Label>
                       <Select value={formData.service_id} onValueChange={(val) => setFormData({...formData, service_id: val})}>
                         <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                         <SelectContent>
                           {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                         </SelectContent>
                       </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border p-3 bg-slate-50">
                     <input type="checkbox" id="nf" checked={formData.invoice_issued} onChange={e => setFormData({...formData, invoice_issued: e.target.checked})} className="h-4 w-4" />
                     <Label htmlFor="nf" className="text-xs font-bold uppercase cursor-pointer">Nota Fiscal Emitida?</Label>
                  </div>

                  {isRecurringService && formData.type === 'income' && (
                    <div className="border-2 border-dashed border-primary/20 p-4 space-y-4 bg-blue-50/30">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="recur" checked={formData.generate_future} onChange={e => setFormData({...formData, generate_future: e.target.checked})} className="h-4 w-4" />
                        <Label htmlFor="recur" className="text-xs font-black uppercase text-primary">Gerar lançamentos futuros automáticos?</Label>
                      </div>
                      
                      {formData.generate_future && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase">Periodicidade</Label>
                            <Select value={formData.recurrence_period} onValueChange={(val) => setFormData({...formData, recurrence_period: val})}>
                              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="months">Mensal</SelectItem>
                                <SelectItem value="weeks">Semanal</SelectItem>
                                <SelectItem value="days">Diário</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase">Duração (Qtd)</Label>
                            <Input type="number" className="h-8 text-xs" value={formData.recurrence_duration} onChange={e => setFormData({...formData, recurrence_duration: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest">
                    Confirmar Lançamento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(6,36,100,1)]">
              <div className="flex items-center gap-3 mb-2 text-[#00c853]">
                <ArrowUpCircle className="h-6 w-6" />
                <span className="text-xs font-black uppercase tracking-widest">Receita (Paga)</span>
              </div>
              <div className="text-2xl font-black italic text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
              </div>
            </div>

            <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(6,36,100,1)]">
              <div className="flex items-center gap-3 mb-2 text-red-500">
                <ArrowDownCircle className="h-6 w-6" />
                <span className="text-xs font-black uppercase tracking-widest">Despesas (Pagas)</span>
              </div>
              <div className="text-2xl font-black italic text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
              </div>
            </div>

            <div className="bg-white border-2 border-primary p-6 shadow-[4px_4px_0px_0px_rgba(6,36,100,1)]">
              <div className="flex items-center gap-3 mb-2 text-orange-500">
                <Calendar className="h-6 w-6" />
                <span className="text-xs font-black uppercase tracking-widest">Saldo Pendente</span>
              </div>
              <div className="text-2xl font-black italic text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingAmount)}
              </div>
            </div>
          </div>

          {/* Controls & Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por descrição..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border-2 border-primary overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b-2 border-primary hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                    <TableHead className="font-bold text-primary px-6 py-4">Data/Vencimento</TableHead>
                    <TableHead className="font-bold text-primary px-6 py-4">Descrição</TableHead>
                    <TableHead className="font-bold text-primary px-6 py-4">Valor</TableHead>
                    <TableHead className="font-bold text-primary px-6 py-4">Status/Pagto</TableHead>
                    <TableHead className="font-bold text-primary px-6 py-4 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground uppercase text-xs font-bold">Nenhum lançamento encontrado.</TableCell></TableRow>
                  ) : (
                    filteredTransactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 group">
                        <TableCell className="px-6 py-4">
                          <div className="text-xs font-bold uppercase">{new Date(t.due_date).toLocaleDateString('pt-BR')}</div>
                          {t.is_paid && <div className="text-[9px] text-[#00c853] font-black italic">PAGO EM {new Date(t.paid_at || '').toLocaleDateString('pt-BR')}</div>}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="font-bold text-primary flex items-center gap-2">
                            {t.type === 'income' ? <ArrowUpCircle className="h-3 w-3 text-[#00c853]" /> : <ArrowDownCircle className="h-3 w-3 text-red-500" />}
                            {t.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {t.client_id && <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20">{clients.find(c => c.id === t.client_id)?.name}</Badge>}
                            {t.invoice_issued && <FileText className="h-3 w-3 text-primary/40" />}
                            {t.recurrence_id && <Calendar className="h-3 w-3 text-blue-400" />}
                          </div>
                        </TableCell>
                        <TableCell className={`px-6 py-4 font-black italic ${t.type === 'income' ? 'text-[#00c853]' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge className={`font-black text-[10px] tracking-tighter w-fit ${t.is_paid ? "bg-[#00c853]" : "bg-red-500"}`}>
                              {t.is_paid ? 'PAGO' : 'PENDENTE'}
                            </Badge>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">{t.payment_method}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${t.is_paid ? 'hover:bg-orange-50' : 'hover:bg-green-50'}`} onClick={() => handleUpdateStatus(t)} title={t.is_paid ? 'Pendente' : 'Pago'}>
                               {t.is_paid ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-[#00c853]" />}
                             </Button>
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                               <Edit2 className="h-4 w-4 text-blue-500" />
                             </Button>
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                               <Trash2 className="h-4 w-4 text-red-500" />
                             </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="animate-in fade-in slide-in-from-right-4">
          <PurchaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
