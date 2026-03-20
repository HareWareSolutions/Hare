import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Users, 
  BarChart2, 
  Clock, 
  AlertCircle,
  Layout,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  Search,
  Zap,
  Filter,
  Eye,
  EyeOff,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Sector {
  id: string;
  name: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface Task {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: string;
  impact: number;
  confidence: number;
  effort: number;
  ice_score: number;
  completed_at: string | null;
  assignee?: User;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  sector_id: string;
  created_at: string;
  tasks: Task[];
}

interface UserWorkload {
  user_id: string;
  user_name: string;
  total_tasks: number;
  completed_tasks: number;
  avg_completion_time: number | null;
}

interface Analytics {
  total_tickets: number;
  total_tasks: number;
  tasks_by_status: Record<string, number>;
  user_workloads: UserWorkload[];
}

export function AssignmentsPanel() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTickets, setExpandedTickets] = useState<Record<string, boolean>>({});

  // Filters
  const [ticketSearch, setTicketSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState('all');
  const [showFinished, setShowFinished] = useState(false);

  // Modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedSupportId, setSelectedSupportId] = useState<string | null>(null);

  // Form states
  const [newSectorName, setNewSectorName] = useState('');
  const [newTicket, setNewTicket] = useState({ title: '', description: '', sector_id: '' });
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    assigned_to: '',
    impact: 5,
    confidence: 5,
    effort: 5
  });
  const [newSupport, setNewSupport] = useState({
    client_id: '',
    service_id: '',
    responsible_id: '',
    solicitation: '',
    gravity: 3,
    urgency: 3,
    tendency: 3
  });
  const [convertSectorId, setConvertSectorId] = useState('');

  // Comparison state
  const [compareUserIds, setCompareUserIds] = useState<string[]>([]);

  const [supports, setSupports] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, sectorsRes, analyticsRes, usersRes, supportsRes, clientsRes, servicesRes] = await Promise.all([
        api.get('/assignments/tickets/'),
        api.get('/assignments/sectors/'),
        api.get('/assignments/analytics'),
        api.get('/users/'),
        api.get('/support/'),
        api.get('/clients/'),
        api.get('/services/')
      ]);
      setTickets(ticketsRes.data);
      setSectors(sectorsRes.data);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setSupports(supportsRes.data);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error fetching assignments data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(ticketSearch.toLowerCase()) || 
                           ticket.description?.toLowerCase().includes(ticketSearch.toLowerCase());
      const matchesSector = sectorFilter === 'all' || ticket.sector_id === sectorFilter;

      // Check if ticket is "finished" (all tasks are 'Finalizada' and has tasks)
      const isFinished = ticket.tasks.length > 0 && ticket.tasks.every(t => t.status === 'Finalizada');
      
      if (!showFinished && isFinished) return false;

      const hasVisibleTasks = ticket.tasks.some(task => {
        const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
        const matchesAssignee = taskAssigneeFilter === 'all' || task.assigned_to === taskAssigneeFilter;
        return matchesStatus && matchesAssignee;
      });

      // If task filters are active, only show tickets with matching tasks
      if (taskStatusFilter !== 'all' || taskAssigneeFilter !== 'all') {
        return matchesSearch && matchesSector && hasVisibleTasks;
      }

      return matchesSearch && matchesSector;
    });
  }, [tickets, ticketSearch, sectorFilter, taskStatusFilter, taskAssigneeFilter, showFinished]);

  const handleCreateSector = async () => {
    if (!newSectorName) return;
    try {
      await api.post('/assignments/sectors/', { name: newSectorName });
      toast.success('Setor criado com sucesso');
      setNewSectorName('');
      setIsSectorModalOpen(false);
      fetchData();
    } catch {
      toast.error('Erro ao criar setor');
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.sector_id) return;
    try {
      await api.post('/assignments/tickets/', newTicket);
      toast.success('Ticket criado com sucesso');
      setNewTicket({ title: '', description: '', sector_id: '' });
      setIsTicketModalOpen(false);
      fetchData();
    } catch {
      toast.error('Erro ao criar ticket');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assigned_to || !selectedTicketId) return;
    try {
      await api.post(`/assignments/tasks/?ticket_id=${selectedTicketId}`, {
        ...newTask,
        status: 'Em espera'
      });
      toast.success('Tarefa adicionada');
      setNewTask({ 
        title: '', 
        description: '', 
        assigned_to: '',
        impact: 5,
        confidence: 5,
        effort: 5
      });
      setIsTaskModalOpen(false);
      fetchData();
    } catch {
      toast.error('Erro ao adicionar tarefa');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/assignments/tasks/${taskId}`, { status });
      toast.success('Status atualizado');
      fetchData();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const toggleTicket = (id: string) => {
    setExpandedTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizada': return 'bg-[#00c853] text-white';
      case 'Execução': return 'bg-[#2979ff] text-white';
      case 'Planejamento': return 'bg-[#ff9100] text-white';
      case 'Controle de Qualidade': return 'bg-[#6200ea] text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const getIceColor = (score: number) => {
    if (score >= 700) return 'bg-rose-500 text-white';
    if (score >= 400) return 'bg-orange-500 text-white';
    if (score >= 100) return 'bg-blue-500 text-white';
    return 'bg-slate-400 text-white';
  };

  const handleOpenTaskModal = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    setSelectedTicketId(ticketId);
    setIsTaskModalOpen(true);
  };

  const toggleUserComparison = (userId: string) => {
    setCompareUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateSupport = async () => {
    try {
      await api.post('/support/', newSupport);
      toast.success('Suporte registrado com sucesso!');
      setIsSupportModalOpen(false);
      setNewSupport({
        client_id: '',
        service_id: '',
        responsible_id: '',
        solicitation: '',
        gravity: 3,
        urgency: 3,
        tendency: 3
      });
      fetchData();
    } catch (error) {
      console.error('Error creating support:', error);
      toast.error('Erro ao registrar suporte');
    }
  };

  const handleConvertSupport = async () => {
    if (!selectedSupportId || !convertSectorId) return;
    try {
      await api.post(`/support/${selectedSupportId}/convert`, { sector_id: convertSectorId });
      toast.success('Suporte convertido em ticket!');
      setIsConvertModalOpen(false);
      setConvertSectorId('');
      setSelectedSupportId(null);
      fetchData();
    } catch (error) {
      console.error('Error converting support:', error);
      toast.error('Erro ao converter suporte');
    }
  };

  const getGutColor = (score: number) => {
    if (score >= 80) return 'bg-rose-500 text-white';
    if (score >= 40) return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Atribuições</h1>
          <p className="text-primary/60 font-medium italic">Gestão de tickets, tarefas e produtividade</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsSectorModalOpen(true)} variant="outline" className="border-2 border-primary/20 font-bold uppercase tracking-widest text-[10px]">
            <Users className="h-4 w-4 mr-2" /> Novo Setor
          </Button>
          <Button onClick={() => setIsSupportModalOpen(true)} variant="outline" className="border-2 border-primary/20 font-bold uppercase tracking-widest text-[10px] hidden md:flex">
             <LifeBuoy className="h-4 w-4 mr-2" /> Novo Suporte
          </Button>
          <Button onClick={() => setIsTicketModalOpen(true)} className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Novo Ticket
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border-2 border-primary/10 p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="tickets" className="uppercase font-black text-[10px] tracking-widest py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-none">
            <Layout className="h-4 w-4 mr-2" /> Tickets & Tasks
          </TabsTrigger>
          <TabsTrigger value="sectors" className="uppercase font-black text-[10px] tracking-widest py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-none">
            <Users className="h-4 w-4 mr-2" /> Setores
          </TabsTrigger>
          <TabsTrigger value="support" className="uppercase font-black text-[10px] tracking-widest py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-none">
            <LifeBuoy className="h-4 w-4 mr-2" /> Suporte
          </TabsTrigger>
          <TabsTrigger value="analytics" className="uppercase font-black text-[10px] tracking-widest py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-white transition-all rounded-none">
            <BarChart2 className="h-4 w-4 mr-2" /> Analítico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 border-2 border-primary/10 rounded-none shadow-sm flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-1">
               <Label className="text-[9px] font-black uppercase tracking-widest text-primary/40">Buscar Ticket</Label>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                  <Input 
                    placeholder="Título ou descrição..." 
                    className="pl-10 border-2 border-primary/5 focus:border-primary/20 rounded-none font-bold"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                  />
               </div>
            </div>
            <div className="w-[180px] space-y-1">
               <Label className="text-[9px] font-black uppercase tracking-widest text-primary/40">Filtrar por Setor</Label>
               <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="border-2 border-primary/5 rounded-none font-bold italic">
                    <SelectValue placeholder="Todos os Setores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Setores</SelectItem>
                    {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
            <div className="w-[180px] space-y-1">
               <Label className="text-[9px] font-black uppercase tracking-widest text-primary/40">Status da Task</Label>
               <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="border-2 border-primary/5 rounded-none font-bold italic">
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Em espera">Em espera</SelectItem>
                    <SelectItem value="Planejamento">Planejamento</SelectItem>
                    <SelectItem value="Execução">Execução</SelectItem>
                    <SelectItem value="Controle de Qualidade">C. Qualidade</SelectItem>
                    <SelectItem value="Finalizada">Finalizada</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <div className="w-[180px] space-y-1">
               <Label className="text-[9px] font-black uppercase tracking-widest text-primary/40">Responsável</Label>
               <Select value={taskAssigneeFilter} onValueChange={setTaskAssigneeFilter}>
                  <SelectTrigger className="border-2 border-primary/5 rounded-none font-bold italic">
                    <SelectValue placeholder="Qualquer Usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Usuários</SelectItem>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFinished(!showFinished)}
                className={`h-10 px-4 rounded-none font-black text-[9px] uppercase tracking-widest transition-all ${
                  showFinished ? 'bg-primary/10 text-primary border-primary/20' : 'text-primary/40 border-primary/5 hover:border-primary/20'
                }`}
            >
                {showFinished ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {showFinished ? 'Ocultar Finalizados' : 'Mostrar Finalizados'}
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                    setTicketSearch('');
                    setSectorFilter('all');
                    setTaskStatusFilter('all');
                    setTaskAssigneeFilter('all');
                    setShowFinished(false);
                }}
                className="h-10 w-10 border-2 border-primary/5 rounded-none text-primary/40"
            >
                <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {loading ? (
               <div className="py-20 text-center font-bold text-primary/40 animate-pulse uppercase tracking-widest italic">Carregando Atribuições...</div>
             ) : filteredTickets.length === 0 ? (
               <div className="py-20 text-center border-4 border-dashed border-primary/10 rounded-3xl bg-white">
                  <AlertCircle className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                  <p className="font-bold text-primary/40 uppercase tracking-widest">Nenhum ticket corresponde aos filtros</p>
               </div>
             ) : (
                filteredTickets.map(ticket => (
                  <Card key={ticket.id} className="border-2 border-primary/10 hover:border-primary/30 transition-all overflow-hidden shadow-sm bg-white">
                    <CardHeader 
                      className="bg-slate-50/50 cursor-pointer select-none"
                      onClick={() => toggleTicket(ticket.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <Badge className="bg-primary text-[9px] uppercase font-black tracking-tighter mb-2">
                             {sectors.find(s => s.id === ticket.sector_id)?.name || 'Setor Indefinido'}
                           </Badge>
                           <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">
                             {ticket.title}
                           </CardTitle>
                           <CardDescription className="font-medium text-primary/60 italic">
                             {ticket.description || 'Sem descrição'}
                           </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right text-[10px] uppercase font-black tracking-widest text-primary/40">
                             <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                             <span>{ticket.tasks.length} Tarefas</span>
                          </div>
                          {expandedTickets[ticket.id] ? <ChevronUp className="h-5 w-5 text-primary/20" /> : <ChevronDown className="h-5 w-5 text-primary/20" />}
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedTickets[ticket.id] && (
                      <div className="p-6 border-t border-primary/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        {ticket.tasks.length === 0 ? (
                          <div className="text-center py-6 text-[10px] uppercase font-bold text-primary/30 tracking-widest">
                            Nenhuma tarefa vinculada a este ticket
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {ticket.tasks
                              .filter(task => {
                                const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
                                const matchesAssignee = taskAssigneeFilter === 'all' || task.assigned_to === taskAssigneeFilter;
                                return matchesStatus && matchesAssignee;
                              })
                              .sort((a, b) => (b.ice_score || 0) - (a.ice_score || 0))
                              .map(task => (
                              <div key={task.id} className="flex items-center justify-between p-4 border-l-4 border-2 border-primary/5 hover:border-primary/20 transition-all bg-white" style={{ borderLeftColor: getStatusColor(task.status).split(' ')[0].replace('bg-', '') }}>
                                <div className="flex-1">
                                   <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-black text-primary text-sm uppercase tracking-tight">{task.title}</h4>
                                      <Badge className={`${getStatusColor(task.status)} text-[8px] uppercase font-black px-1.5 py-0`}>
                                        {task.status}
                                      </Badge>
                                      {task.ice_score > 0 && (
                                        <Badge className={`${getIceColor(task.ice_score)} text-[8px] uppercase font-black px-1.5 py-0 flex items-center gap-1`}>
                                            <Zap className="h-2.5 w-2.5 fill-current" /> ICE: {task.ice_score}
                                        </Badge>
                                      )}
                                   </div>
                                   <p className="text-xs text-primary/60 font-medium italic mb-2">{task.description}</p>
                                   <div className="flex items-center gap-4">
                                      <div className="flex items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                                        <UserIcon className="h-3 w-3 mr-1" /> {task.assignee?.full_name || 'Desconhecido'}
                                      </div>
                                      <div className="flex gap-2 text-[8px] font-black text-primary/20 uppercase tracking-widest">
                                         <span>I: {task.impact}</span>
                                         <span>C: {task.confidence}</span>
                                         <span>E: {task.effort}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Select 
                                     value={task.status} 
                                     onValueChange={(val) => updateTaskStatus(task.id, val)}
                                   >
                                     <SelectTrigger className="h-8 w-[140px] text-[10px] font-black uppercase tracking-widest border-2 border-primary/10 italic">
                                       <SelectValue placeholder="Mudar Status" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="Em espera">Em espera</SelectItem>
                                       <SelectItem value="Planejamento">Planejamento</SelectItem>
                                       <SelectItem value="Execução">Execução</SelectItem>
                                       <SelectItem value="Controle de Qualidade">C. Qualidade</SelectItem>
                                       <SelectItem value="Finalizada">Finalizada</SelectItem>
                                     </SelectContent>
                                   </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button 
                          onClick={(e) => handleOpenTaskModal(e, ticket.id)}
                          variant="ghost" 
                          size="sm" 
                          className="w-full border-2 border-dashed border-primary/10 hover:border-primary/40 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary py-6"
                        >
                          <Plus className="h-3 w-3 mr-2" /> Adicionar Tarefa com Prioridade
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
             )}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sectors.map(sector => (
              <Card key={sector.id} className="border-2 border-primary/10 p-6 flex items-center justify-between group hover:border-primary/40 transition-all bg-white shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/5 flex items-center justify-center border-2 border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-primary uppercase tracking-tighter text-lg">{sector.name}</h3>
                    <p className="text-[10px] uppercase font-bold text-primary/40 tracking-widest">ID: {sector.id.slice(0, 8)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/10 p-6 bg-white shadow-sm">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center">
                <Layout className="h-4 w-4 mr-2" /> Status das Tarefas
              </h3>
              <div className="space-y-4">
                {analytics && Object.entries(analytics.tasks_by_status).map(([status, count]) => (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/60">
                      <span>{status}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-primary/5">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ 
                          width: `${(count / (analytics.total_tasks || 1)) * 100}%`,
                          backgroundColor: getStatusColor(status).split(' ')[0].replace('bg-', '') 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-2 border-primary/10 p-6 bg-white shadow-sm">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center">
                <Users className="h-4 w-4 mr-2" /> Entrega por Usuário
              </h3>
              <div className="space-y-6">
                {analytics?.user_workloads.map((workload, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center font-black text-white uppercase text-xs">
                      {workload.user_name.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight">{workload.user_name}</span>
                          <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{workload.completed_tasks} / {workload.total_tasks} FINALIZADAS</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#00c853] transition-all duration-1000" 
                            style={{ width: `${(workload.completed_tasks / (workload.total_tasks || 1)) * 100}%` }}
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="border-2 border-primary/10 p-8 bg-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <h2 className="text-xl font-black text-primary uppercase tracking-tighter mb-4">Comparador de Performance</h2>
            <p className="text-primary/60 text-sm font-medium italic mb-8 max-w-xl">
              Selecione os usuários abaixo para comparar suas taxas de entrega e produtividade lado a lado.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
               {users.map(u => (
                 <Badge 
                    key={u.id}
                    onClick={() => toggleUserComparison(u.id)}
                    className={`cursor-pointer px-4 py-2 uppercase font-black text-[9px] tracking-widest transition-all ${
                      compareUserIds.includes(u.id) ? 'bg-primary text-white' : 'bg-slate-100 text-primary/40 hover:bg-slate-200'
                    }`}
                 >
                   {u.full_name || u.email}
                 </Badge>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {compareUserIds.map(userId => {
                 const workload = analytics?.user_workloads.find(w => w.user_id === userId);
                 if (!workload) return null;
                 return (
                   <div key={userId} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center">
                         <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-primary/20">
                            <span className="font-black text-primary text-lg">{workload.user_name.slice(0, 2)}</span>
                         </div>
                         <h4 className="font-black text-primary uppercase tracking-tight">{workload.user_name}</h4>
                         <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">Taxa de Conclusão</p>
                      </div>
                      <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                           <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                           <circle 
                             cx="96" cy="96" r="80" 
                             stroke="currentColor" strokeWidth="12" 
                             fill="transparent" 
                             strokeDasharray={502} 
                             strokeDashoffset={502 - (502 * (workload.completed_tasks / (workload.total_tasks || 1)))} 
                             className="text-[#00c853] transition-all duration-1000"
                             strokeLinecap="round"
                           />
                         </svg>
                         <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-primary">{Math.round((workload.completed_tasks / (workload.total_tasks || 1)) * 100)}%</span>
                            <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">FINALIZADAS</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                         <div className="p-3 bg-slate-50 border-2 border-primary/5">
                            <p className="text-[16px] font-black text-primary">{workload.total_tasks}</p>
                            <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Total</p>
                         </div>
                         <div className="p-3 bg-slate-50 border-2 border-primary/5">
                            <p className="text-[16px] font-black text-[#00c853]">{workload.completed_tasks}</p>
                            <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Concluídas</p>
                         </div>
                      </div>
                      {workload.avg_completion_time && (
                        <div className="p-3 bg-primary/5 border-2 border-primary/10 text-center">
                           <p className="text-[14px] font-black text-primary">{workload.avg_completion_time.toFixed(1)}h</p>
                           <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest">Tempo Médio p/ Tarefa</p>
                        </div>
                      )}
                   </div>
                 );
               })}
               {compareUserIds.length === 0 && (
                 <div className="col-span-3 py-12 text-center border-4 border-dotted border-primary/5 rounded-3xl">
                   <Users className="h-10 w-10 text-primary/10 mx-auto mb-4" />
                   <p className="font-bold text-primary/20 uppercase tracking-widest italic">Nenhum usuário selecionado para comparação</p>
                 </div>
               )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-6 space-y-6">
          <div className="bg-white p-6 border-2 border-primary/10 rounded-none shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Chamados de Suporte</h2>
              <Button onClick={() => setIsSupportModalOpen(true)} className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px]">
                <Plus className="h-4 w-4 mr-2" /> Novo Chamado
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {supports.length === 0 ? (
                <div className="py-20 text-center border-4 border-dashed border-primary/10 rounded-3xl bg-slate-50">
                  <LifeBuoy className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                  <p className="font-bold text-primary/40 uppercase tracking-widest">Nenhum chamado de suporte registrado</p>
                </div>
              ) : (
                supports.map(support => (
                  <Card key={support.id} className="border-2 border-primary/10 hover:border-primary/20 transition-all p-6 bg-white relative overflow-hidden group">
                    {support.is_converted && (
                      <div className="absolute top-0 right-0 bg-[#00c853] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rotate-45 translate-x-4 translate-y-2">
                        Convertido
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">
                            {support.client?.name || 'Cliente Desconhecido'}
                          </Badge>
                          {support.service && (
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest italic border-primary/10">
                              {support.service.name}
                            </Badge>
                          )}
                          <Badge className={`${getGutColor(support.gut_score)} text-[9px] font-black uppercase tracking-widest px-2 py-0.5`}>
                             GUT: {support.gut_score}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-black text-primary uppercase tracking-tight">{support.solicitation}</h3>
                        
                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                             <UserIcon className="h-3 w-3 mr-1" /> {support.responsible?.full_name || 'Desconhecido'}
                           </div>
                           <div className="flex items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                             <Clock className="h-3 w-3 mr-1" /> {new Date(support.created_at).toLocaleString()}
                           </div>
                           <div className="flex gap-3 text-[9px] font-black text-primary/20 uppercase tracking-widest">
                             <span>G: {support.gravity}</span>
                             <span>U: {support.urgency}</span>
                             <span>T: {support.tendency}</span>
                           </div>
                        </div>
                      </div>

                      {!support.is_converted && (
                        <Button 
                          onClick={() => {
                            setSelectedSupportId(support.id);
                            setIsConvertModalOpen(true);
                          }}
                          className="bg-primary/5 hover:bg-primary text-primary hover:text-white border-2 border-primary/10 hover:border-primary font-black text-[9px] uppercase tracking-widest px-4 py-2 h-auto"
                        >
                          Converter em Ticket
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isSectorModalOpen} onOpenChange={setIsSectorModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Novo Setor</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              Cadastre um novo setor para organizar os tickets da empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sector-name" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Nome do Setor</Label>
              <Input 
                id="sector-name" 
                placeholder="Ex: Financeiro, TI, Vendas" 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectorModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleCreateSector} className="bg-primary rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Salvar Setor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Novo Ticket</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              Inicie um novo ticket de serviço vinculado a um setor específico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Setor Responsável</Label>
              <Select onValueChange={(val) => setNewTicket({...newTicket, sector_id: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-title" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Título do Ticket</Label>
              <Input 
                id="ticket-title" 
                placeholder="Ex: Refatorar API de Clientes" 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-desc" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Descrição</Label>
              <Input 
                id="ticket-desc" 
                placeholder="Descreva o objetivo deste ticket..." 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleCreateTicket} className="bg-primary rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Criar Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Adicionar Tarefa com Prioridade</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              Utilize o Score ICE para definir a prioridade técnica da tarefa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Atribuir a</Label>
              <Select onValueChange={(val) => setNewTask({...newTask, assigned_to: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Nome da Tarefa</Label>
              <Input 
                id="task-title" 
                placeholder="Ex: Criar migrations" 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            
            {/* ICE SCORE INPUTS */}
            <div className="p-4 bg-slate-50 border-2 border-primary/5 space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-2">
                 <Zap className="h-3 w-3" /> Metodologia ICE (1-10)
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60">Impacto</Label>
                    <Select value={String(newTask.impact)} onValueChange={(val) => setNewTask({...newTask, impact: Number(val)})}>
                      <SelectTrigger className="h-8 border-2 border-primary/5 rounded-none font-bold">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60">Confiança</Label>
                    <Select value={String(newTask.confidence)} onValueChange={(val) => setNewTask({...newTask, confidence: Number(val)})}>
                      <SelectTrigger className="h-8 border-2 border-primary/5 rounded-none font-bold">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-primary/60">Esforço</Label>
                    <Select value={String(newTask.effort)} onValueChange={(val) => setNewTask({...newTask, effort: Number(val)})}>
                      <SelectTrigger className="h-8 border-2 border-primary/5 rounded-none font-bold">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
               
               <div className="pt-4 border-t-2 border-primary/5 flex justify-between items-center text-primary">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Score Projetado:</span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-rose-500 fill-current" />
                    <span className="text-2xl font-black italic">
                      {newTask.impact * newTask.confidence * (11 - newTask.effort)}
                    </span>
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Observações</Label>
              <Input 
                id="task-desc" 
                placeholder="Instruções para o executor..." 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleAddTask} className="bg-primary rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Salvar Tarefa Priorizada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSupportModalOpen} onOpenChange={setIsSupportModalOpen}>
        <DialogContent className="max-w-md border-4 border-primary shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">Registrar Suporte</DialogTitle>
            <DialogDescription className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">
              Gere um chamado de suporte e defina sua prioridade GUT.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Cliente</Label>
              <Select onValueChange={(val) => setNewSupport({...newSupport, client_id: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Serviço Relacionado</Label>
              <Select onValueChange={(val) => setNewSupport({...newSupport, service_id: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Serviço (Opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Responsável</Label>
              <Select onValueChange={(val) => setNewSupport({...newSupport, responsible_id: val})}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Quem vai atender?" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-solicitation" className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Solicitação / Problema</Label>
              <Input 
                id="support-solicitation" 
                placeholder="Descreva o que o cliente precisa..." 
                className="border-2 border-primary/10 font-bold rounded-none"
                value={newSupport.solicitation}
                onChange={(e) => setNewSupport({...newSupport, solicitation: e.target.value})}
              />
            </div>

            <div className="p-4 bg-slate-50 border-2 border-primary/5 space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Matriz GUT (1-5)</h4>
               <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest">Gravidade</Label>
                    <Select value={String(newSupport.gravity)} onValueChange={(val) => setNewSupport({...newSupport, gravity: Number(val)})}>
                      <SelectTrigger className="h-8 border-2 border-primary/5 rounded-none font-bold text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest">Urgência</Label>
                    <Select value={String(newSupport.urgency)} onValueChange={(val) => setNewSupport({...newSupport, urgency: Number(val)})}>
                      <SelectTrigger className="h-8 border-2 border-primary/5 rounded-none font-bold text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest">Tendência</Label>
                    <Select value={String(newSupport.tendency)} onValueChange={(val) => setNewSupport({...newSupport, tendency: Number(val)})}>
                      <SelectTrigger className="h-8 border-2 border-primary/5 rounded-none font-bold text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
               <div className="flex justify-between items-center text-primary pt-2 border-t border-primary/5">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Score GUT:</span>
                  <span className="text-xl font-black italic">{newSupport.gravity * newSupport.urgency * newSupport.tendency}</span>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupportModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleCreateSupport} className="bg-primary rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Registrar Chamado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent className="max-w-md border-4 border-[#00c853] shadow-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#00c853] uppercase tracking-tighter">Converter em Ticket</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Escolha o setor responsável para este novo ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Setor de Destino</Label>
              <Select onValueChange={setConvertSectorId}>
                <SelectTrigger className="border-2 border-primary/10 font-bold rounded-none">
                  <SelectValue placeholder="Selecione o Setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[10px] text-primary/40 font-medium italic">
              * Isso criará um ticket e uma tarefa inicial para o responsável designado.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertModalOpen(false)} className="rounded-none font-bold uppercase tracking-widest text-[10px] border-2 border-primary/10">Cancelar</Button>
            <Button onClick={handleConvertSupport} className="bg-[#00c853] hover:bg-[#00c853]/90 text-white rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8">Confirmar Conversão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
