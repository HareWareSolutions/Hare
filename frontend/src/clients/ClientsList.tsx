import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  document: string;
  is_active: boolean;
}

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', document: '', type: 'PF', is_active: true });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients/');
      setClients(res.data);
    } catch (err) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clients/', formData);
      toast.success('Cliente cadastrado com sucesso!');
      setIsDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', document: '', type: 'PF', is_active: true });
      fetchClients();
    } catch (err) {
      toast.error('Erro ao cadastrar cliente');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      await api.put(`/clients/${editingClient.id}`, formData);
      toast.success('Cliente atualizado com sucesso!');
      setIsEditOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      toast.error('Erro ao atualizar cliente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Cliente excluído com sucesso!');
      fetchClients();
    } catch (err) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      await api.put(`/clients/${client.id}`, { is_active: !client.is_active });
      toast.success(`Cliente ${!client.is_active ? 'ativado' : 'desativado'} com sucesso!`);
      fetchClients();
    } catch (err) {
      toast.error('Erro ao alterar status do cliente');
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      document: client.document || '',
      type: client.type,
      is_active: client.is_active
    });
    setIsEditOpen(true);
  };

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black italic uppercase text-primary">Clientes</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo / Razão Social</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Documento (CPF/CNPJ)</Label>
                  <Input value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo / Razão Social</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Documento (CPF/CNPJ)</Label>
                  <Input value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Salvar Alterações</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar clientes..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4">Nome / Contato</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4">Tipo</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4">Documento</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4 text-center">Status</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-bold uppercase text-[10px]">Carregando...</TableCell></TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-bold uppercase text-[10px]">Nenhum cliente encontrado.</TableCell></TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold text-primary">{client.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">{client.email || 'Sem email'}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="secondary" className="font-bold uppercase text-[10px] tracking-tighter">{client.type}</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-medium text-slate-500">{client.document || '-'}</TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant={client.is_active ? 'default' : 'destructive'} 
                      className={`font-black text-[10px] tracking-tighter ${client.is_active ? 'bg-[#00c853] text-white' : ''}`}>
                      {client.is_active ? 'ATIVO' : 'INATIVO'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-orange-50" onClick={() => handleToggleStatus(client)} title={client.is_active ? 'Desativar' : 'Ativar'}>
                         {client.is_active ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-[#00c853]" />}
                       </Button>
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => openEditModal(client)} title="Editar">
                         <Edit2 className="h-4 w-4 text-blue-500" />
                       </Button>
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(client.id)} title="Excluir">
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
  );
}
