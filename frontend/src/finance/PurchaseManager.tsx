import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle, XCircle, ShoppingCart, Users, History, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Supplier {
  id: string;
  name: string;
  tax_id?: string;
  contact_email?: string;
  phone?: string;
  price_histories: any[];
}

interface PurchaseItem {
  name: string;
  price: number;
  quantity: number;
}

interface PurchaseRequest {
  id: string;
  supplier_id?: string;
  description: string;
  total_amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  items: PurchaseItem[];
  created_at: string;
  requester_id: string;
}

export function PurchaseManager() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  const [requestForm, setRequestForm] = useState({
    description: '',
    supplier_id: '',
    items: [{ name: '', price: 0, quantity: 1 }]
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    tax_id: '',
    contact_email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('purchases/'),
        api.get('suppliers/')
      ]);
      setRequests(rRes.data);
      setSuppliers(sRes.data);
    } catch (err) {
      toast.error('Erro ao carregar dados de compras');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const total_amount = requestForm.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    try {
      await api.post('purchases/', {
        ...requestForm,
        total_amount,
        supplier_id: requestForm.supplier_id || null
      });
      toast.success('Solicitação criada com sucesso!');
      setIsRequestDialogOpen(false);
      setRequestForm({ description: '', supplier_id: '', items: [{ name: '', price: 0, quantity: 1 }] });
      fetchData();
    } catch (err) {
      toast.error('Erro ao criar solicitação');
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('suppliers/', supplierForm);
      toast.success('Fornecedor cadastrado!');
      setIsSupplierDialogOpen(false);
      setSupplierForm({ name: '', tax_id: '', contact_email: '', phone: '', address: '' });
      fetchData();
    } catch (err) {
      toast.error('Erro ao cadastrar fornecedor');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`purchases/${id}`, { status });
      toast.success(`Solicitação ${status === 'APPROVED' ? 'aprovada' : 'rejeitada'}`);
      fetchData();
    } catch (err) {
      toast.error('Erro ao atualizar status');
    }
  };

  const addItem = () => {
    setRequestForm({ ...requestForm, items: [...requestForm.items, { name: '', price: 0, quantity: 1 }] });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...requestForm.items];
    if (field === 'price' || field === 'quantity') {
      const val = value === '' ? 0 : parseFloat(value);
      (newItems[index] as any)[field] = isNaN(val) ? 0 : val;
    } else {
      (newItems[index] as any)[field] = value;
    }
    setRequestForm({ ...requestForm, items: newItems });
  };

  const removeItem = (index: number) => {
    if (requestForm.items.length === 1) return;
    setRequestForm({ ...requestForm, items: requestForm.items.filter((_, i) => i !== index) });
  };

  const filteredRequests = requests.filter(r => {
    if (showResolved) return true;
    return r.status === 'PENDING';
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-slate-100 p-1 border-2 border-primary">
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest px-6 py-2">
              <ShoppingCart className="w-3 h-3 mr-2" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest px-6 py-2">
              <Users className="w-3 h-3 mr-2" /> Fornecedores
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            {activeTab === 'requests' && (
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md px-3 border border-slate-200">
                <input 
                  type="checkbox" 
                  id="showResolved" 
                  checked={showResolved} 
                  onChange={e => setShowResolved(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="showResolved" className="text-[10px] font-black uppercase text-primary cursor-pointer">Mostrar Resolvidos</Label>
              </div>
            )}
            <div className="flex gap-2">
            {activeTab === 'requests' ? (
              <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-accent hover:text-primary transition-all font-bold text-xs uppercase tracking-widest">
                    <Plus className="mr-2 h-4 w-4" /> Nova Solicitação
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black italic uppercase text-primary">Nova Solicitação de Compra</DialogTitle>
                    <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">Informe os itens e o fornecedor para aprovação.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRequest} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Fornecedor (Opcional)</Label>
                          <Select value={requestForm.supplier_id} onValueChange={(val) => setRequestForm({...requestForm, supplier_id: val})}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                              {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Título/Descrição</Label>
                          <Input required value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})} placeholder="Ex: Materiais de Escritório" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <Label className="text-xs font-black uppercase text-primary">Itens da Compra</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-[10px] uppercase font-bold border-primary border-2">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {requestForm.items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 border border-slate-200">
                              <div className="col-span-6 space-y-1">
                                <Label className="text-[9px] font-bold uppercase">Produto</Label>
                                <Input required value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="h-8 text-xs" />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <Label className="text-[9px] font-bold uppercase">Qtd</Label>
                                <Input type="number" step="0.01" required value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="h-8 text-xs" />
                              </div>
                              <div className="col-span-3 space-y-1">
                                <Label className="text-[9px] font-bold uppercase">Preço Un.</Label>
                                <Input type="number" step="0.01" required value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} className="h-8 text-xs" />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-8 w-8 p-0 hover:bg-red-50 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end p-2 bg-primary/5 border border-primary/10">
                           <span className="text-xs font-black uppercase text-primary">Total: R$ {requestForm.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(240,185,11,1)]">
                      Enviar para Aprovação
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-accent hover:text-primary transition-all font-bold text-xs uppercase tracking-widest">
                    <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black italic uppercase text-primary">Cadastrar Fornecedor</DialogTitle>
                    <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">Ficha básica para histórico e contatos.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSupplier} className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Nome / Razão Social</Label>
                       <Input required value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">CNPJ / CPF</Label>
                        <Input value={supplierForm.tax_id} onChange={e => setSupplierForm({...supplierForm, tax_id: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Telefone</Label>
                        <Input value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Email de Contato</Label>
                       <Input type="email" value={supplierForm.contact_email} onChange={e => setSupplierForm({...supplierForm, contact_email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold uppercase">Endereço</Label>
                       <Input value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(240,185,11,1)]">
                      Salvar Fornecedor
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <TabsContent value="requests" className="space-y-4 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="rounded-md border-2 border-primary overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b-2 border-primary hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                  <TableHead className="font-bold text-primary px-6 py-4">Status</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4">Descrição / Fornecedor</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4">Valor Total</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell></TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-bold uppercase text-xs">Nenhuma solicitação encontrada.</TableCell></TableRow>
                ) : (
                  filteredRequests.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <TableCell className="px-6 py-4">
                        <Badge className={`font-black text-[10px] tracking-tighter ${
                          r.status === 'APPROVED' ? 'bg-[#00c853]' : 
                          r.status === 'REJECTED' ? 'bg-red-500' : 
                          r.status === 'PENDING' ? 'bg-orange-500' : 'bg-slate-500'
                        }`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="font-bold text-primary">{r.description}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                          {suppliers.find(s => s.id === r.supplier_id)?.name || 'Sem Fornecedor'} • {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-black italic text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.total_amount)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        {r.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50" onClick={() => handleUpdateStatus(r.id, 'APPROVED')} title="Aprovar">
                              <CheckCircle className="h-4 w-4 text-[#00c853]" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleUpdateStatus(r.id, 'REJECTED')} title="Rejeitar">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 ml-2" title="Ver Itens">
                              <Package className="h-4 w-4 text-blue-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black italic uppercase text-primary">Itens da Solicitação</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="border border-slate-200 rounded-md">
                                <Table>
                                  <TableHeader className="bg-slate-50">
                                    <TableRow className="text-[9px] uppercase font-bold">
                                      <TableHead>Produto</TableHead>
                                      <TableHead>Qtd</TableHead>
                                      <TableHead>Preço</TableHead>
                                      <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {r.items.map((item, i) => (
                                      <TableRow key={i} className="text-xs">
                                        <TableCell className="font-bold">{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-black">R$ {(item.quantity * item.price).toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4 animate-in fade-in slide-in-from-right-2 transition-all">
          <div className="rounded-md border-2 border-primary overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b-2 border-primary hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                  <TableHead className="font-bold text-primary px-6 py-4">Fornecedor</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4">Contato / Documento</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground font-bold uppercase text-xs">Nenhum fornecedor cadastrado.</TableCell></TableRow>
                ) : (
                  suppliers.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <TableCell className="px-6 py-4">
                        <div className="font-bold text-primary">{s.name}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">{s.phone || 'Sem telefone'}</div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-xs font-medium">{s.contact_email || 'Sem email'}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">{s.tax_id || 'Sem documento'}</div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" title="Histórico de Preços">
                              <History className="h-4 w-4 text-blue-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black italic uppercase text-primary">Histórico de Preços</DialogTitle>
                              <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">Evolução de valores para este fornecedor.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="border border-slate-200 rounded-md overflow-hidden">
                                <Table>
                                  <TableHeader className="bg-slate-50">
                                    <TableRow className="text-[9px] uppercase font-bold">
                                      <TableHead>Produto</TableHead>
                                      <TableHead>Data</TableHead>
                                      <TableHead className="text-right">Preço</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {s.price_histories.length === 0 ? (
                                      <TableRow><TableCell colSpan={3} className="text-center py-4 text-[10px] uppercase font-bold opacity-50">Nenhum histórico.</TableCell></TableRow>
                                    ) : (
                                      s.price_histories.map((h, i) => (
                                        <TableRow key={i} className="text-xs">
                                          <TableCell className="font-bold">{h.product_name}</TableCell>
                                          <TableCell>{new Date(h.date).toLocaleDateString('pt-BR')}</TableCell>
                                          <TableCell className="text-right font-black italic text-primary">R$ {h.price.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
