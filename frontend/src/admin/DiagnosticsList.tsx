import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronRight, Search, Filter, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Diagnostic {
  id: string;
  nome_empresa: string;
  nome_responsavel: string;
  quantidade_colaboradores: number;
  email: string;
  telefone: string;
  atendimento_score: number;
  comunicacao_score: number;
  processos_score: number;
  marketing_score: number;
  produtividade_score: number;
  tecnologia_score: number;
  score_total: number;
  classificacao: string;
  gargalo_critico: boolean;
  data_criacao: string;
}

export function DiagnosticsList({ hideTitle = false }: { hideTitle?: boolean }) {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiag, setSelectedDiag] = useState<Diagnostic | null>(null);

  // Filters
  const [filterClassificacao, setFilterClassificacao] = useState('Todas');
  const [filterScoresBaixo, setFilterScoresBaixo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      const { data } = await api.get('/diagnostics/admin');
      setDiagnostics(data);
    } catch (error) {
      console.error('Failed to fetch diagnostics', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiagnostics = diagnostics.filter(diag => {
    if (filterClassificacao !== 'Todas' && diag.classificacao !== filterClassificacao) return false;
    if (filterScoresBaixo && !diag.gargalo_critico) return false;
    
    const searchLow = searchTerm.toLowerCase();
    if (searchTerm) {
      const matchName = diag.nome_empresa.toLowerCase().includes(searchLow);
      const matchEmail = diag.email.toLowerCase().includes(searchLow);
      const matchPhone = diag.telefone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
      const matchResp = (diag.nome_responsavel || '').toLowerCase().includes(searchLow);
      
      if (!matchName && !matchEmail && !matchPhone && !matchResp) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {!hideTitle && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic text-[#062464]">Diagnósticos (Leads)</h1>
            <p className="text-muted-foreground mt-1">Análise dos formulários HARE SCORE recebidos.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-white p-4 border border-[#b3b2b2]">
        <div className="flex items-center text-sm font-bold text-[#062464] uppercase"><Filter className="w-4 h-4 mr-2" /> Filtros</div>
        
        <select 
          className="border border-[#b3b2b2] p-2 text-sm focus:outline-none focus:border-[#00c853]"
          value={filterClassificacao}
          onChange={(e) => setFilterClassificacao(e.target.value)}
        >
          <option value="Todas">Todas as Classificações</option>
          <option value="Empresa Travada">Empresa Travada (0-10)</option>
          <option value="Empresa Instável">Empresa Instável (11-18)</option>
          <option value="Empresa Estruturada">Empresa Estruturada (19-24)</option>
          <option value="Empresa Escalável">Empresa Escalável (25-30)</option>
        </select>

        <label className="flex items-center space-x-2 text-sm text-[#062464]">
          <input 
            type="checkbox" 
            checked={filterScoresBaixo}
            onChange={(e) => setFilterScoresBaixo(e.target.checked)}
            className="accent-[#062464]"
          />
          <span className="font-bold uppercase text-[10px]">Apenas Gargalos Críticos</span>
        </label>

        <div className="flex-1"></div>

        <div className="relative w-72">
           <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
           <input 
             type="text"
             placeholder="Buscar lead por telefone, nome ou email..."
             className="w-full border border-[#b3b2b2] h-10 pl-9 pr-4 text-sm focus:outline-none focus:border-[#00c853] bg-slate-50 font-medium"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LIST */}
        <div className="lg:col-span-2 bg-white border border-[#b3b2b2] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#062464] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Empresa / Lead</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Gargalo</th>
                  <th className="px-6 py-4 text-center">Data</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b3b2b2]">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Carregando...</td></tr>
                ) : filteredDiagnostics.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum diagnóstico encontrado.</td></tr>
                ) : filteredDiagnostics.map((diag) => (
                  <tr 
                    key={diag.id} 
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedDiag?.id === diag.id ? 'bg-[#00c853]/5' : ''}`}
                    onClick={() => setSelectedDiag(diag)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#062464]">{diag.nome_empresa}</div>
                      <div className="text-xs text-muted-foreground">{diag.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-lg">{diag.score_total}</span><span className="text-xs text-muted-foreground">/30</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        diag.score_total > 18 ? 'bg-[#00c853]/10 text-[#00c853] border border-[#00c853]' :
                        diag.score_total > 10 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {diag.classificacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {diag.gargalo_critico ? (
                        <div className="inline-flex items-center text-red-600 bg-red-100 px-2 py-1 text-xs font-bold gap-1 rounded">
                          <AlertTriangle className="w-3 h-3" /> SIM
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-muted-foreground">
                      {format(new Date(diag.data_criacao), 'dd MMM yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#062464]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILS PANEL */}
        <div className="bg-white border border-[#b3b2b2] flex flex-col min-h-[500px]">
          {selectedDiag ? (
            <>
              <div className="bg-[#062464] text-white p-6 border-b border-[#062464]">
                <h3 className="text-xl font-bold uppercase">{selectedDiag.nome_empresa}</h3>
                <p className="text-white/70 text-sm mt-1">Contato: {selectedDiag.nome_responsavel || 'Não informado'} — {selectedDiag.telefone}</p>
                <div className="mt-4 flex gap-4 text-sm font-medium">
                  <div className="bg-white/10 px-3 py-1 rounded border border-white/20"><Users className="inline w-4 h-4 mr-2" /> {selectedDiag.quantidade_colaboradores} Colaboradores</div>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00c853] block">Score Final</span>
                    <span className="text-4xl font-black italic text-[#062464]">{selectedDiag.score_total}<span className="text-xl text-muted-foreground">/30</span></span>
                  </div>
                  {selectedDiag.gargalo_critico && (
                     <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold max-w-[150px]">
                       <AlertTriangle className="w-6 h-6 shrink-0" />
                       Atenção: Contém Gargalo Crítico
                     </div>
                  )}
                </div>

                <h4 className="font-bold text-[#062464] uppercase text-xs tracking-widest mb-4 border-b border-slate-200 pb-2">Detalhamento das Respostas</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Atendimento', score: selectedDiag.atendimento_score },
                    { label: 'Comunicação Interna', score: selectedDiag.comunicacao_score },
                    { label: 'Processos', score: selectedDiag.processos_score },
                    { label: 'Marketing', score: selectedDiag.marketing_score },
                    { label: 'Produtividade', score: selectedDiag.produtividade_score },
                    { label: 'Tecnologia', score: selectedDiag.tecnologia_score },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#062464]">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {/* Status bar visualization */}
                        <div className="flex gap-1 w-24">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-2 flex-1 rounded-sm ${
                              item.score >= i ? (item.score <= 1 ? 'bg-red-500' : item.score <= 3 ? 'bg-yellow-400' : 'bg-[#00c853]') : 'bg-slate-200'
                            }`}></div>
                          ))}
                        </div>
                        <span className={`text-xs font-bold w-4 text-right ${item.score <= 1 ? 'text-red-500' : 'text-[#062464]'}`}>{item.score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-[#b3b2b2]">
                  <Button className="w-full bg-[#00c853] text-white hover:bg-[#062464] rounded-none uppercase font-bold tracking-widest h-12">
                    <a href={`https://wa.me/55${selectedDiag.telefone.replace(/\D/g, '')}?text=Ol%C3%A1%20${selectedDiag.nome_responsavel || ''}!%20Verificamos%20o%20diagn%C3%B3stico%20da%20${selectedDiag.nome_empresa}.`} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center">
                      Chamar no WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <Search className="w-12 h-12 text-slate-200 mb-4" />
              <p>Selecione um diagnóstico na lista<br/>para visualizar os detalhes completos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
