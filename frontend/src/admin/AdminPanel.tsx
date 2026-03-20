import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Lock, Unlock, Building2, Package, Users, Trash2, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PlansManager } from './PlansManager';
import { DiagnosticsList } from './DiagnosticsList';
import { ApprovalsList } from './ApprovalsList';

interface Company {
  id: string;
  name: string;
  subscription_status: string;
  is_active: boolean;
  users_count?: number;
  created_at: string;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'companies' | 'plans' | 'diagnostics' | 'approvals'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    }
  }, [activeTab]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data);
    } catch (err) {
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (company: Company) => {
    try {
      if (company.is_active) {
        await api.post(`/admin/block-company/${company.id}`);
        toast.success(`Empresa ${company.name} bloqueada.`);
      } else {
        await api.post(`/admin/unblock-company/${company.id}`);
        toast.success(`Empresa ${company.name} desbloqueada.`);
      }
      fetchCompanies();
    } catch (error) {
      toast.error('Erro ao alterar status da empresa');
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente a empresa ${company.name}? Todos os dados (usuários, clientes, serviços) serão perdidos.`)) {
      return;
    }
    try {
      await api.delete(`/admin/companies/${company.id}`);
      toast.success(`Empresa ${company.name} excluída com sucesso.`);
      fetchCompanies();
    } catch (error) {
      toast.error('Erro ao excluir empresa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <Shield className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-black italic uppercase text-primary">Painel Superadmin</h2>
      </div>

      <div className="flex space-x-4 border-b border-border mb-6">
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'companies' 
              ? 'border-b-2 border-primary text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('companies')}
        >
          <div className="flex items-center"><Building2 className="h-4 w-4 mr-2"/> Empresas</div>
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'plans' 
              ? 'border-b-2 border-primary text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('plans')}
        >
          <div className="flex items-center"><Package className="h-4 w-4 mr-2"/> Planos de Assinatura</div>
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'diagnostics' 
              ? 'border-b-2 border-primary text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('diagnostics')}
        >
          <div className="flex items-center"><Users className="h-4 w-4 mr-2"/> Diagnósticos (Leads)</div>
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'approvals' 
              ? 'border-b-2 border-primary text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('approvals')}
        >
          <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> Aprovações</div>
        </button>
      </div>

      {activeTab === 'companies' && (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : companies.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhuma empresa encontrada.</TableCell></TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant={company.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {company.subscription_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.is_active ? 'default' : 'destructive'} className={company.is_active ? 'bg-success text-white border-transparent' : ''}>
                        {company.is_active ? 'Ativa' : 'Bloqueada'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(company.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-2 border-primary p-0 overflow-hidden sm:max-w-[500px]">
                          <DialogHeader className="p-6 bg-[#062464] text-white">
                            <DialogTitle className="text-2xl font-black italic uppercase italic">Detalhes da Empresa</DialogTitle>
                            <DialogDescription className="text-white/70 font-bold uppercase text-xs tracking-widest">{company.name}</DialogDescription>
                          </DialogHeader>
                          <div className="p-6 space-y-6 bg-slate-50">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-4 border border-primary/20 shadow-sm">
                                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Usuários Criados</span>
                                <span className="text-2xl font-black text-primary italic">{company.users_count || 0}</span>
                              </div>
                              <div className="bg-white p-4 border border-primary/20 shadow-sm">
                                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Status Assinatura</span>
                                <Badge variant={company.subscription_status === 'active' ? 'default' : 'secondary'} className="mt-1 font-black">
                                  {company.subscription_status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="bg-white p-4 border border-primary/20 shadow-sm">
                                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Data Cadastro</span>
                                <span className="text-sm font-bold text-primary">{new Date(company.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="bg-white p-4 border border-primary/20 shadow-sm">
                                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Status Conta</span>
                                <Badge variant={company.is_active ? 'default' : 'destructive'} className={`${company.is_active ? 'bg-[#00c853]' : ''} mt-1 font-black`}>
                                  {company.is_active ? 'ATIVA' : 'BLOQUEADA'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="bg-[#062464]/5 border-l-4 border-[#062464] p-4 text-xs font-medium text-primary uppercase tracking-wider">
                              ID: {company.id}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant={company.is_active ? "destructive" : "default"} 
                        size="sm"
                        onClick={() => handleToggleBlock(company)}
                      >
                        {company.is_active ? <><Lock className="h-4 w-4 mr-1" /> Bloquear</> : <><Unlock className="h-4 w-4 mr-1" /> Desbloquear</>}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 font-bold uppercase"
                        onClick={() => handleDeleteCompany(company)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === 'plans' && (
        <PlansManager />
      )}

      {activeTab === 'diagnostics' && (
        <DiagnosticsList hideTitle={true} />
      )}

      {activeTab === 'approvals' && (
        <ApprovalsList />
      )}
    </div>
  );
}
