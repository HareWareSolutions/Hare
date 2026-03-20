import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, UserPlus, Building2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Request {
  id: string;
  type: string;
  status: string;
  company_id: string;
  company_name?: string;
  payload: any;
  created_at: string;
}

export function ApprovalsList() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        req.company_name?.toLowerCase().includes(lowerSearch) ||
        req.payload.full_name?.toLowerCase().includes(lowerSearch) ||
        req.payload.email?.toLowerCase().includes(lowerSearch) ||
        req.type.toLowerCase().includes(lowerSearch);
      
      const matchesStatus = showOnlyPending ? req.status === 'pending' : true;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, showOnlyPending]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/admin');
      setRequests(res.data);
    } catch (err) {
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/requests/admin/${requestId}/${action}`);
      toast.success(action === 'approve' ? 'Solicitação aprovada!' : 'Solicitação rejeitada.');
      fetchRequests();
    } catch (err) {
      toast.error('Erro ao processar solicitação');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-border rounded-md shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa, nome ou email..."
            className="pl-9 h-10 border-2 border-primary/20 focus:border-primary font-bold uppercase text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button
          variant={showOnlyPending ? "default" : "outline"}
          size="sm"
          className={`font-black uppercase text-[10px] tracking-widest ${showOnlyPending ? 'bg-primary' : 'border-2 border-primary/20'}`}
          onClick={() => setShowOnlyPending(!showOnlyPending)}
        >
          <Filter className="h-3 w-3 mr-2" />
          {showOnlyPending ? "Ocultando Resolvidos" : "Mostrando Todos"}
        </Button>
      </div>

      <div className="rounded-md border border-border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Tipo / Empresa</TableHead>
              <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Detalhes</TableHead>
              <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Data</TableHead>
              <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-6 py-4">Status</TableHead>
              <TableHead className="text-right px-6 py-4 font-bold text-primary uppercase text-[10px] tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground uppercase text-xs font-bold">Nenhuma solicitação encontrada.</TableCell></TableRow>
            ) : (
              filteredRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {req.type === 'user_creation' ? <UserPlus className="h-4 w-4 text-primary/60" /> : 
                        req.type === 'account_approval' ? <Building2 className="h-4 w-4 text-primary/60" /> :
                        <Clock className="h-4 w-4 text-primary/60" />}
                       <span className="font-black text-primary italic text-xs uppercase">
                         {req.type === 'user_creation' ? 'Criação de Usuário' : 
                          req.type === 'account_approval' ? 'Novo Cadastro SaaS' :
                          req.type}
                       </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Building2 className="h-3 w-3" /> {req.company_name || 'Desconhecida'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {req.type === 'user_creation' ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-primary">{req.payload.full_name}</div>
                        <div className="text-[10px] text-muted-foreground">{req.payload.email}</div>
                      </div>
                    ) : req.type === 'account_approval' ? (
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-primary">{req.payload.full_name} ({req.payload.company_name})</div>
                        <div className="flex gap-2 text-[10px] font-medium uppercase tracking-tighter">
                          <span className="text-muted-foreground">{req.payload.email}</span>
                          <span className="text-primary/60 font-black">|</span>
                          <span className="text-accent">{req.payload.document_type}: {req.payload.document}</span>
                          <span className="text-primary/60 font-black">|</span>
                          <span className="text-primary">{req.payload.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-[10px]">{JSON.stringify(req.payload)}</pre>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-medium text-slate-500">
                    {new Date(req.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'approved' ? 'default' : 'destructive'} 
                      className={`font-black text-[10px] tracking-tighter ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        req.status === 'approved' ? 'bg-[#00c853] text-white' : ''}`}>
                      {req.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleAction(req.id, 'reject')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-[#00c853] text-white hover:bg-[#062464]"
                          onClick={() => handleAction(req.id, 'approve')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
