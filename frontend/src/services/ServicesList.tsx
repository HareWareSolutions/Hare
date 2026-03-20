import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description: string;
  value: number;
  type: string;
}

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', value: '', type: 'unique' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/');
      setServices(res.data);
    } catch (err) {
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services/', {
        ...formData,
        value: parseFloat(formData.value) || 0
      });
      toast.success('Serviço cadastrado com sucesso!');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', value: '', type: 'unique' });
      fetchServices();
    } catch (err) {
      toast.error('Erro ao cadastrar serviço');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await api.put(`/services/${editingService.id}`, {
        ...formData,
        value: parseFloat(formData.value) || 0
      });
      toast.success('Serviço atualizado com sucesso!');
      setIsEditOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      toast.error('Erro ao atualizar serviço');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Serviço excluído com sucesso!');
      fetchServices();
    } catch (err) {
      toast.error('Erro ao excluir serviço');
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      value: service.value.toString(),
      type: service.type
    });
    setIsEditOpen(true);
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black italic uppercase text-primary">Serviços</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Serviço</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Cobrança</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unique">Único</SelectItem>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Serviço</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Cobrança</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unique">Único</SelectItem>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            placeholder="Buscar serviços..." 
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
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4">Serviço</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4">Valor</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4">Tipo</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary px-6 py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-bold uppercase text-[10px]">Carregando...</TableCell></TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-bold uppercase text-[10px]">Nenhum serviço encontrado.</TableCell></TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold text-primary">{service.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium max-w-xs truncate">{service.description || 'Sem descrição'}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold text-primary italic">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.value)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={service.type === 'recurring' ? 'default' : 'secondary'} className="font-bold uppercase text-[10px] tracking-tighter">
                      {service.type === 'recurring' ? 'Recorrente' : 'Pagamento Único'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => openEditModal(service)} title="Editar">
                         <Edit2 className="h-4 w-4 text-blue-500" />
                       </Button>
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(service.id)} title="Excluir">
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
