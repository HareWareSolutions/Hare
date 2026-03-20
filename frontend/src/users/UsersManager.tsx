import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Clock, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
}

interface UserRequest {
  id: string;
  type: string;
  status: string;
  payload: {
    email: string;
    full_name: string;
  };
  created_at: string;
}

export function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, requestsRes, rolesRes] = await Promise.all([
        api.get('/users/'),
        api.get('/requests/'),
        api.get('/roles/')
      ]);
      setUsers(usersRes.data);
      setRequests(requestsRes.data.filter((r: any) => r.type === 'user_creation'));
      setAvailableRoles(rolesRes.data);
    } catch (err) {
      toast.error('Erro ao carregar dados de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/requests/', {
        type: 'user_creation',
        payload: {
          email,
          full_name: fullName,
          password
        }
      });
      toast.success('Solicitação de criação de usuário enviada para aprovação!');
      setIsDialogOpen(false);
      setEmail('');
      setFullName('');
      setPassword('');
      fetchData();
    } catch (err) {
      toast.error('Erro ao enviar solicitação');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updateData: any = { 
        full_name: fullName, 
        email,
        role_ids: selectedRoleIds
      };
      if (password) updateData.password = password;
      
      await api.put(`/users/${editingUser.id}`, updateData);
      toast.success('Usuário atualizado com sucesso!');
      setIsEditOpen(false);
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuário excluído com sucesso!');
      fetchData();
    } catch (err) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`Usuário ${!user.is_active ? 'ativado' : 'desativado'} com sucesso!`);
      fetchData();
    } catch (err) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFullName(user.full_name);
    setEmail(user.email);
    setPassword('');
    setSelectedRoleIds(user.roles.map(r => r.id));
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setPassword('');
    setSelectedRoleIds([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-primary">Gestão de Equipe</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-wider">Gerencie os operadores da sua empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00c853] hover:bg-[#062464] text-white">
              <UserPlus className="h-4 w-4 mr-2" /> Novo Operador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-2 border-primary p-2">
            <DialogHeader className="p-4 border-b border-border bg-slate-50">
              <DialogTitle className="text-xl font-black italic uppercase text-primary">Solicitar Novo Usuário</DialogTitle>
              <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">
                O pedido passará por aprovação do superadmin antes de ser criado.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase text-primary">Nome Completo</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-primary">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase text-primary">Senha Temporária</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-slate-50" />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest mt-4">
                Enviar Solicitação
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px] border-2 border-primary p-2">
            <DialogHeader className="p-4 border-b border-border bg-slate-50">
              <DialogTitle className="text-xl font-black italic uppercase text-primary">Editar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName" className="text-xs font-bold uppercase text-primary">Nome Completo</Label>
                <Input id="editFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail" className="text-xs font-bold uppercase text-primary">Email</Label>
                <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPassword" className="text-xs font-bold uppercase text-primary">Nova Senha (opcional)</Label>
                <Input id="editPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para manter" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-primary mb-2 block">Atribuir Cargos</Label>
                <div className="grid grid-cols-2 gap-2 border-2 border-primary/10 p-3 bg-slate-50/50 max-h-[150px] overflow-y-auto">
                   {availableRoles.map(role => (
                     <div key={role.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`role-${role.id}`}
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() => {
                            setSelectedRoleIds(prev => 
                              prev.includes(role.id) ? prev.filter(id => id !== role.id) : [...prev, role.id]
                            )
                          }}
                          className="h-3 w-3 rounded text-primary"
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-[10px] font-bold uppercase cursor-pointer">{role.name}</Label>
                     </div>
                   ))}
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest mt-4">
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ACTIVE USERS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">Usuários Ativos</h3>
        <div className="bg-white border-2 border-primary shadow-[4px_4px_0px_0px_rgba(6,36,100,1)] overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b-2 border-primary hover:bg-slate-50">
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Nome / Email</TableHead>
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Cargos</TableHead>
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Status</TableHead>
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest text-right px-6 py-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground uppercase text-xs font-bold">Nenhum usuário ativo.</TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <TableCell className="px-6 py-4">
                      <div className="font-black text-primary italic">{u.full_name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">{u.email}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="flex flex-wrap gap-1">
                          {u.roles.map(r => (
                            <Badge key={r.id} variant="secondary" className="text-[8px] font-black uppercase tracking-tighter bg-primary/10 text-primary border-primary/20">
                              {r.name}
                            </Badge>
                          ))}
                          {u.roles.length === 0 && <span className="text-[9px] text-muted-foreground italic font-bold">Sem Cargo</span>}
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`font-black text-[10px] tracking-tighter ${u.is_active ? "bg-[#00c853] text-white" : "bg-red-500 text-white"}`}>
                        {u.is_active ? 'ATIVO' : 'INATIVO'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleToggleStatus(u)}>
                           {u.is_active ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-[#00c853]" />}
                         </Button>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(u)}>
                           <Edit2 className="h-4 w-4 text-blue-500" />
                         </Button>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(u.id)}>
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

      {/* PENDING REQUESTS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">Solicitações de Criação</h3>
        <div className="bg-white border border-[#b3b2b2]">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Lead / Usuário</TableHead>
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Data Solicitação</TableHead>
                <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-4">Carregando...</TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground uppercase text-xs font-bold">Nenhuma solicitação recente.</TableCell></TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-bold text-primary">{r.payload.full_name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.payload.email}</div>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {r.status === 'pending' && <Badge className="bg-yellow-400 text-yellow-900 border-none font-bold text-[10px] tracking-tighter"><Clock className="w-3 h-3 mr-1" /> PENDENTE</Badge>}
                        {r.status === 'approved' && <Badge className="bg-[#00c853] text-white border-none font-bold text-[10px] tracking-tighter"><CheckCircle className="w-3 h-3 mr-1" /> APROVADO</Badge>}
                        {r.status === 'rejected' && <Badge className="bg-red-500 text-white border-none font-bold text-[10px] tracking-tighter"><XCircle className="w-3 h-3 mr-1" /> NEGADO</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
