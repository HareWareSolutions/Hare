import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ArrowRight, 
  Briefcase, 
  Users, 
  User as UserIcon, 
  Mail, 
  Phone,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const QUESTIONS = [
  {
    id: 'atendimento_score',
    title: 'Atendimento',
    text: 'Seu atendimento responde rápido, organizado e sem perder informações?',
  },
  {
    id: 'comunicacao_score',
    title: 'Comunicação interna',
    text: 'Sua equipe tem clareza e alinhamento nas informações e decisões?',
  },
  {
    id: 'processos_score',
    title: 'Processos',
    text: 'Sua empresa possui processos definidos e padronizados?',
  },
  {
    id: 'marketing_score',
    title: 'Marketing e vendas',
    text: 'Você tem previsibilidade na geração de clientes e controle do funil?',
  },
  {
    id: 'produtividade_score',
    title: 'Produtividade',
    text: 'Sua equipe é produtiva e bem organizada no dia a dia?',
  },
  {
    id: 'tecnologia_score',
    title: 'Tecnologia e automação',
    text: 'Sua empresa usa tecnologia para automatizar processos e reduzir erros?',
  }
];

export function DiagnosticModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome_empresa: '',
    quantidade_colaboradores: '',
    nome_responsavel: '',
    email: '',
    telefone: '',
    aceita_termos: false,
    scores: {
      atendimento_score: 3,
      comunicacao_score: 3,
      processos_score: 3,
      marketing_score: 3,
      produtividade_score: 3,
      tecnologia_score: 3,
    }
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'telefone') {
      // Simple mask: numbers only, format if needed. 
      // For now just storing raw string or simple formatting.
      value = value.replace(/\D/g, '').substring(0, 11);
      if (value.length > 2) value = `(${value.substring(0,2)}) ${value.substring(2)}`;
      if (value.length > 9) value = `${value.substring(0,10)}-${value.substring(10)}`;
    } else if (e.target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScoreChange = (id: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [id]: value }
    }));
  };

  const validateStep1 = () => {
    return formData.nome_empresa.trim() !== '' && 
           formData.quantidade_colaboradores !== '' && 
           Number(formData.quantidade_colaboradores) > 0 &&
           formData.email.trim() !== '' && 
           formData.email.includes('@') &&
           formData.telefone.replace(/\D/g, '').length >= 10 &&
           formData.aceita_termos;
  };

  const getStatusText = (classificacao: string) => {
    switch (classificacao) {
      case 'Empresa Travada': return "Sua empresa depende de processos manuais e está perdendo eficiência.";
      case 'Empresa Instável': return "Existem gargalos que estão limitando seu crescimento.";
      case 'Empresa Estruturada': return "Sua empresa já possui base, mas ainda pode evoluir em eficiência.";
      case 'Empresa Escalável': return "Sua empresa está preparada para crescer com previsibilidade.";
      default: return "";
    }
  };

  const submitDiagnosis = async () => {
    setLoading(true);
    try {
      const payload = {
        nome_empresa: formData.nome_empresa,
        nome_responsavel: formData.nome_responsavel || null,
        quantidade_colaboradores: parseInt(formData.quantidade_colaboradores),
        email: formData.email,
        telefone: formData.telefone,
        ...formData.scores
      };

      const { data } = await api.post('/diagnostics/submit', payload);
      
      setResult(data);
      setStep(3); // Result step
    } catch (error: any) {
      console.error('Submit error:', error.response?.data || error);
      const detail = error.response?.data?.detail;
      const errorMsg = Array.isArray(detail) ? detail[0]?.msg : (typeof detail === 'string' ? detail : 'Verifique sua conexão.');
      alert(`Erro ao enviar diagnóstico. Detalhe: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#062464]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl border border-[#b3b2b2] shadow-2xl flex flex-col my-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#b3b2b2] bg-slate-50 sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00c853]">HARE SCORE</span>
            <h2 className="text-2xl font-black italic text-[#062464]">Auto Diagnóstico Operacional</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 transition-colors text-[#062464]">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="inline-flex items-center px-3 py-1 bg-[#062464] text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                Etapa 1: Perfil da Empresa
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#062464] mb-2 flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Nome da Empresa *</label>
                  <input type="text" name="nome_empresa" value={formData.nome_empresa} onChange={handleInputChange} className="w-full border border-[#b3b2b2] p-3 text-sm focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] transition-all bg-slate-50" placeholder="Ex: Acme Corp" required />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#062464] mb-2 flex items-center"><Users className="w-4 h-4 mr-2" /> Colaboradores *</label>
                    <input type="number" name="quantidade_colaboradores" value={formData.quantidade_colaboradores} onChange={handleInputChange} className="w-full border border-[#b3b2b2] p-3 text-sm focus:outline-none focus:border-[#00c853] transition-all bg-slate-50" placeholder="Apenas números" required min="1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#062464] mb-2 flex items-center"><UserIcon className="w-4 h-4 mr-2" /> Seu Nome</label>
                    <input type="text" name="nome_responsavel" value={formData.nome_responsavel} onChange={handleInputChange} className="w-full border border-[#b3b2b2] p-3 text-sm focus:outline-none focus:border-[#00c853] transition-all bg-slate-50" placeholder="Opcional" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#062464] mb-2 flex items-center"><Mail className="w-4 h-4 mr-2" /> E-mail Profissional *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-[#b3b2b2] p-3 text-sm focus:outline-none focus:border-[#00c853] transition-all bg-slate-50" placeholder="email@empresa.com" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#062464] mb-2 flex items-center"><Phone className="w-4 h-4 mr-2" /> WhatsApp *</label>
                    <input type="text" name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full border border-[#b3b2b2] p-3 text-sm focus:outline-none focus:border-[#00c853] transition-all bg-slate-50" placeholder="(19) 90000-0000" required />
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4 bg-white p-4 border border-[#b3b2b2]">
                  <input 
                    type="checkbox" 
                    id="aceita_termos" 
                    name="aceita_termos"
                    checked={formData.aceita_termos} 
                    onChange={handleInputChange} 
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border-[#b3b2b2] text-[#00c853] focus:ring-[#00c853]" 
                    required 
                  />
                  <label htmlFor="aceita_termos" className="text-[10px] sm:text-xs font-medium text-[#062464]/80 leading-tight">
                    Li e concordo com os <Link to="/privacidade" className="font-bold underline text-[#00c853] hover:text-[#062464] transition-colors" target="_blank">Termos de Uso e Privacidade</Link>. Estou ciente de que as informações fornecidas serão processadas para fins comerciais e emissão do diagnóstico operacional.
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-[#b3b2b2] flex justify-end">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!validateStep1()}
                  className="rounded-none bg-[#062464] hover:bg-[#00c853] text-white h-12 px-8 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar Diagnóstico <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-[#062464] text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  Etapa 2: Análise de Processos
                </div>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-[#062464] uppercase underline hover:text-[#00c853]">Responsáveis</button>
              </div>

              <p className="text-sm font-medium text-[#062464]/80">Avalie cada área de <strong className="text-[#062464]">0 (Péssimo / Inexistente)</strong> a <strong className="text-[#00c853]">5 (Excelente / Automatizado)</strong>.</p>
              
              <div className="space-y-8">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="border-b border-[#b3b2b2] pb-6 last:border-0 last:pb-0">
                    <h4 className="font-bold text-[#062464] uppercase text-sm mb-1">{q.title}</h4>
                    <p className="text-xs text-[#062464]/70 font-medium mb-4">{q.text}</p>
                    
                    <div className="flex gap-2 w-full">
                      {[0, 1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleScoreChange(q.id, val)}
                          className={`flex-1 h-10 border transition-all font-bold text-sm ${
                            formData.scores[q.id as keyof typeof formData.scores] === val
                              ? 'bg-[#062464] border-[#062464] text-white shadow-md'
                              : 'bg-white border-[#b3b2b2] text-[#062464] hover:border-[#062464]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-[#b3b2b2] flex justify-end">
                <Button 
                  onClick={submitDiagnosis} 
                  disabled={loading}
                  className="rounded-none bg-[#00c853] hover:bg-[#062464] text-white h-14 px-8 font-black uppercase tracking-widest transition-colors w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Gerar Hare Score'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="text-center animate-in zoom-in-95 duration-500 py-8">
              
              <div className="mb-8 relative inline-block">
                {/* Circular Score display */}
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke={result.score_total > 18 ? "#00c853" : result.score_total > 10 ? "#facc15" : "#ef4444"} strokeWidth="12" strokeDasharray={`${(result.score_total / 30) * 439.8} 439.8`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black italic text-[#062464] leading-none">{result.score_total}</span>
                  <span className="text-sm font-bold text-[#b3b2b2]">/ 30</span>
                </div>
              </div>

              <div className="inline-flex items-center px-4 py-2 border mb-6" style={{ borderColor: result.score_total > 18 ? '#00c853' : result.score_total > 10 ? '#facc15' : '#ef4444' }}>
                <span className="font-black uppercase tracking-widest text-lg" style={{ color: result.score_total > 18 ? '#00c853' : result.score_total > 10 ? '#ca8a04' : '#ef4444' }}>
                  {result.classificacao}
                </span>
              </div>

              <p className="text-lg md:text-xl font-medium text-[#062464] max-w-lg mx-auto leading-relaxed mb-6">
                "{getStatusText(result.classificacao)}"
              </p>

              {result.gargalo_critico && (
                 <div className="bg-red-50 border border-red-200 text-red-700 p-4 font-medium text-sm text-left flex items-start mx-auto max-w-lg mb-8 rounded-md">
                    <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
                    <div>
                      Detectamos um ou mais <strong>gargalos críticos (Score 0 ou 1)</strong> que estão punindo severamente outras áreas da sua empresa. Sem consertar o básico, não há escalabilidade.
                    </div>
                 </div>
              )}

              <div className="pt-8 mt-4 border-t border-[#b3b2b2]">
                <Button asChild size="lg" className="rounded-none h-16 w-full max-w-lg mx-auto font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-transform" style={{ backgroundColor: '#00c853', color: '#ffffff' }}>
                  <a href="https://wa.me/5519996075939?text=Ol%C3%A1%21+Acabei+de+gerar+meu+HARE+SCORE+no+site+e+quero+estruturar+melhor+minha+empresa." target="_blank" rel="noreferrer">
                    <CheckCircle2 className="mr-3 h-5 w-5" /> Quero melhorar minha empresa
                  </a>
                </Button>
                <p className="mt-4 text-[10px] text-[#b3b2b2] font-bold uppercase tracking-widest">
                  Falar direto com consultor
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
