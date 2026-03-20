import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  Activity, 
  TrendingUp, 
  LifeBuoy, 
  CheckSquare, 
  Target,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-black text-primary uppercase animate-pulse">Carregando Radar do Sistema...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black italic uppercase text-primary tracking-tighter">Central de Comando</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 italic">Visão 360° das operações da empresa</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Clients */}
        <Card className="border-2 border-primary/10 hover:border-primary transition-all rounded-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Base de Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary/20" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary italic italic">{stats?.total_clients || 0}</div>
            <p className="text-[9px] font-bold text-primary/30 uppercase mt-1">Contatos Ativos</p>
          </CardContent>
        </Card>

        {/* Support */}
        <Link to="/dashboard/assignments">
          <Card className="border-2 border-primary/10 hover:border-red-500 transition-all rounded-none shadow-sm group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Suporte em Aberto</CardTitle>
              <LifeBuoy className="h-4 w-4 text-red-500/20 group-hover:text-red-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-red-500 italic">{stats?.support?.open_requests || 0}</div>
              <p className="text-[9px] font-bold text-red-500/40 uppercase mt-1 flex items-center gap-1">
                Aguardando Triagem <ArrowRight className="h-2 w-2" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Tasks */}
        <Link to="/dashboard/assignments">
          <Card className="border-2 border-primary/10 hover:border-primary transition-all rounded-none shadow-sm group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Minhas Tarefas</CardTitle>
              <CheckSquare className="h-4 w-4 text-primary/20 group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary italic">{stats?.assignments?.user_pending || 0}</div>
              <p className="text-[9px] font-bold text-primary/30 uppercase mt-1">Pendentes de Execução</p>
            </CardContent>
          </Card>
        </Link>

        {/* Services */}
        <Card className="border-2 border-primary/10 hover:border-primary transition-all rounded-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Catálogo Ativo</CardTitle>
            <Briefcase className="h-4 w-4 text-primary/20" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary italic">{stats?.active_services || 0}</div>
            <p className="text-[9px] font-bold text-primary/30 uppercase mt-1">Serviços Disponíveis</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-4">
        {/* Sales Progress */}
        <Card className="col-span-4 border-2 border-primary rounded-none shadow-[4px_4px_0_0_rgba(6,36,100,0.1)]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#00c853]" /> Desempenho de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Faturamento Mensal</p>
                   <p className="text-2xl font-black text-primary italic">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.sales?.current_value || 0)}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Meta</p>
                   <p className="text-sm font-black text-primary/20 italic">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.sales?.goal || 0)}
                   </p>
                </div>
             </div>
             
             <div className="h-4 w-full bg-slate-100 border border-primary/10 overflow-hidden relative">
                <div 
                  className="h-full bg-[#00c853] transition-all duration-1000 ease-out flex items-center justify-end px-2" 
                  style={{ width: `${Math.min(stats?.sales?.progress || 0, 100)}%` }}
                >
                   {stats?.sales?.progress >= 20 && <span className="text-[7px] font-black text-white">{Math.round(stats?.sales?.progress)}%</span>}
                </div>
             </div>
             
             <div className="pt-4 border-t border-primary/5 flex justify-between items-center">
                <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Progresso da Empresa</p>
                <Link to="/dashboard/sales" className="text-[9px] font-black text-link uppercase hover:underline flex items-center gap-1">
                   Ver Detalhes <ArrowRight className="h-2 w-2" />
                </Link>
             </div>
          </CardContent>
        </Card>

        {/* Fast Action / Status */}
        <Card className="col-span-3 border-2 border-primary/10 rounded-none bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Atividade do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-white border border-primary/10">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-[#00c853] animate-pulse" />
                   <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Servidor API</span>
                </div>
                <Badge variant="outline" className="text-[8px] border-[#00c853] text-[#00c853] font-black">ESTÁVEL</Badge>
             </div>
             
             <div className="flex items-center justify-between p-3 bg-white border border-primary/10">
                <div className="flex items-center gap-3">
                   <Target className="h-4 w-4 text-primary/20" />
                   <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Tarefas Globais</span>
                </div>
                <div className="text-sm font-black text-primary italic">{stats?.assignments?.total_pending || 0}</div>
             </div>

             <div className="p-4 bg-primary text-white space-y-2 mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest italic opacity-80">Insight do Dia</p>
                <p className="text-xs font-bold leading-relaxed">
                  {stats?.support?.open_requests > 3 
                    ? "Volume alto de chamados. Priorize a triagem no suporte." 
                    : stats?.sales?.progress > 80 
                    ? "Meta quase batida! Foque no fechamento dos leads quentes." 
                    : "Mantenha o ritmo! Organize suas tarefas pendentes para hoje."}
                </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
