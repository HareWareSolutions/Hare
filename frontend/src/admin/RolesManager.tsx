import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Shield, ShieldCheck, ShieldAlert, Edit2, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { group: 'Geral', items: [
    { code: 'dashboard.view', name: 'Ver Dashboard' },
    { code: '*', name: 'Acesso Total (Superuser)' }
  ]},
  { group: 'Vendas & CRM', items: [
    { code: 'sales.read', name: 'Ver Vendas e Metas' },
    { code: 'sales.write', name: 'Registrar Vendas / Ajustar Metas' },
    { code: 'sales.funnel.read', name: 'Ver Funil de CRM' },
    { code: 'sales.funnel.write', name: 'Gerenciar Leads e Etapas' }
  ]},
  { group: 'Atribuições & Tarefas', items: [
    { code: 'assignments.read', name: 'Ver Tickets e Tarefas' },
    { code: 'assignments.write', name: 'Criar Tickets e Atribuir Tarefas' },
    { code: 'assignments.tasks.update', name: 'Atualizar Status de Tarefas' }
  ]},
  { group: 'Suporte', items: [
    { code: 'support.read', name: 'Ver Solicitações de Suporte' },
    { code: 'support.write', name: 'Registrar/Converter Suporte' }
  ]},
  { group: 'Financeiro', items: [
    { code: 'finance.read', name: 'Ver Fluxo de Caixa' },
    { code: 'finance.write', name: 'Realizar Lançamentos / Compras' },
    { code: 'finance.delete', name: 'Excluir Lançamentos' }
  ]},
  { group: 'Clientes & Serviços', items: [
    { code: 'clients.read', name: 'Ver Clientes' },
    { code: 'clients.write', name: 'Gerenciar Clientes' },
    { code: 'services.read', name: 'Ver Serviços' },
    { code: 'services.write', name: 'Gerenciar Serviços' }
  ]},
  { group: 'Equipe & Admin', items: [
    { code: 'users.read', name: 'Ver Usuários' },
    { code: 'users.write', name: 'Gerenciar Usuários' },
    { code: 'roles.manage', name: 'Gerenciar Cargos e Permissões' },
    { code: 'documents.read', name: 'Acesso a Documentos' }
  ]}
];

export function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles/');
      setRoles(res.data);
    } catch (err) {
      toast.error('Erro ao carregar cargos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (code: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter(p => p !== code)
        : [...prev.permissions, code]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData);
        toast.success('Cargo atualizado com sucesso!');
      } else {
        await api.post('/roles/', formData);
        toast.success('Cargo criado com sucesso!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchRoles();
    } catch (err) {
      toast.error('Erro ao salvar cargo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este cargo? Usuários vinculados poderão perder acessos.')) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Cargo excluído');
      fetchRoles();
    } catch (err) {
      toast.error('Erro ao excluir cargo');
    }
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-primary">Cargos e Permissões</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-wider">Defina os níveis de acesso para sua equipe</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-accent hover:text-primary transition-all font-bold">
              <Plus className="mr-2 h-4 w-4" /> Novo Cargo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic uppercase text-primary">
                {editingRole ? 'Editar Cargo' : 'Novo Cargo Personalizado'}
              </DialogTitle>
              <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">
                Personalize as permissões de acesso deste cargo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Nome do Cargo</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Operador Logístico" className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Descrição</Label>
                  <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Responsável por gerenciar pedidos e estoque" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Seleção de Permissões
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-2 border-primary/10 p-4 bg-slate-50/50">
                   {AVAILABLE_PERMISSIONS.map(group => (
                     <div key={group.group} className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-tighter text-primary/40 border-b border-primary/10 pb-1">{group.group}</h4>
                        <div className="space-y-2">
                           {group.items.map(p => (
                             <div key={p.code} className="flex items-center space-x-2">
                                <input 
                                  type="checkbox" 
                                  id={p.code} 
                                  checked={formData.permissions.includes(p.code) || formData.permissions.includes('*')}
                                  disabled={formData.permissions.includes('*') && p.code !== '*'}
                                  onChange={() => handleTogglePermission(p.code)}
                                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor={p.code} className="text-[11px] font-bold uppercase cursor-pointer hover:text-primary transition-colors">{p.name}</Label>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest">
                {editingRole ? 'Salvar Alterações' : 'Criar Cargo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-blue-50/50 border-l-4 border-primary p-4 flex gap-4 items-center">
         <Info className="h-5 w-5 text-primary shrink-0" />
         <p className="text-xs font-bold uppercase tracking-wide text-primary/80">
           Cargos de sistema (<Badge className="bg-primary text-[8px]">SISTEMA</Badge>) são pré-definidos e não podem ser editados. 
           Eles servem como base para a estrutura da sua empresa.
         </p>
      </div>

      <div className="rounded-md border-2 border-primary overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(6,36,100,0.05)]">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-b-2 border-primary hover:bg-slate-50 uppercase text-[10px] tracking-widest">
              <TableHead className="font-bold text-primary px-6 py-4">Status</TableHead>
              <TableHead className="font-bold text-primary px-6 py-4">Nome do Cargo</TableHead>
              <TableHead className="font-bold text-primary px-6 py-4">Descrição</TableHead>
              <TableHead className="font-bold text-primary px-6 py-4">Permissões</TableHead>
              <TableHead className="font-bold text-primary px-6 py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 group">
                  <TableCell className="px-6 py-4">
                    {role.is_system ? (
                      <Badge className="bg-primary text-[8px] font-black italic uppercase">Sistema</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] font-black italic uppercase border-primary/30 text-primary/60">Personalizado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="font-black italic uppercase text-primary flex items-center gap-2">
                       {role.is_system ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                       {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground italic">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                       {role.permissions.includes('*') ? (
                         <Badge className="bg-green-500 text-[8px] font-black italic">ACESSO TOTAL (*)</Badge>
                       ) : (
                         role.permissions.slice(0, 3).map(p => (
                           <Badge key={p} variant="secondary" className="text-[8px] font-bold uppercase tracking-tighter opacity-70">
                             {p.split('.')[0]}
                           </Badge>
                         ))
                       )}
                       {role.permissions.length > 3 && !role.permissions.includes('*') && (
                         <span className="text-[8px] font-bold text-primary/40">+{role.permissions.length - 3}</span>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {!role.is_system && (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => openEdit(role)}>
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(role.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                    {role.is_system && <ShieldAlert className="h-4 w-4 text-primary/20 ml-auto" />}
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
