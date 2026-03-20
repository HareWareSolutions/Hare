import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Search, 
  FolderTree, 
  Users, 
  TrendingUp, 
  Cpu,
  AlertOctagon,
  Activity,
  ShieldCheck,
  CheckCircle,
  FileText,
  Zap,
  Menu,
  Instagram,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useState } from 'react';
import { DiagnosticModal } from './DiagnosticModal';
import { CookieBanner } from './CookieBanner';

export function LandingPage() {
  const [activePhase, setActivePhase] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#062464] font-sans selection:bg-[#00c853]/20">
      
      {/* HEADER */}
      <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: '#b3b2b2' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[72px] sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo_full.png" alt="HareWare" className="h-8 sm:h-12 object-contain" />
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Button onClick={() => setDiagnosticOpen(true)} className="rounded-none font-bold uppercase tracking-wider transition-all h-12 px-8" style={{ backgroundColor: '#062464', color: '#ffffff' }}>
              Iniciar Diagnóstico Gratuito
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6 text-[#062464]" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-4" style={{ borderColor: '#b3b2b2' }}>
            <Button onClick={() => setDiagnosticOpen(true)} className="w-full rounded-none font-bold uppercase tracking-wider" style={{ backgroundColor: '#062464', color: '#ffffff' }}>
              Iniciar Diagnóstico Gratuito
            </Button>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b" style={{ borderColor: '#b3b2b2' }}>
          <div className="absolute inset-x-0 top-0 h-full opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#b3b2b2 1px, transparent 1px), linear-gradient(90deg, #b3b2b2 1px, transparent 1px)', backgroundSize: '20px 20px md:40px md:40px' }}>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-28 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 py-1 border border-[#062464] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] bg-white">
                O Design como Prova de Conceito
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic leading-[1.05] sm:leading-[0.95] tracking-tighter break-words">
                DA OPERAÇÃO CAÓTICA AO ORGANISMO AUTOMATIZADO.
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl font-medium max-w-xl leading-relaxed text-[#062464]/80">
                Pare de perder dinheiro com processos mal definidos e dependência de pessoas. 
                O <strong className="font-bold text-[#062464]">Método HareWare</strong> é uma transição técnica e definitiva para a escalabilidade.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2 sm:pt-4">
                <Button onClick={() => setDiagnosticOpen(true)} size="lg" className="rounded-none text-sm sm:text-base h-14 sm:h-16 w-full sm:w-auto px-6 sm:px-10 font-bold uppercase tracking-widest hover:scale-105 transition-transform" style={{ backgroundColor: '#00c853', color: '#ffffff' }}>
                  Explorar o Método <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile-optimized Dashboard Mockup */}
            <div className="relative bg-white border-2 border-[#062464] shadow-xl p-1 font-mono text-xs sm:text-sm w-full max-w-lg mx-auto lg:mr-0">
              <div className="bg-[#062464] text-white p-2 sm:p-3 flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs truncate mr-2">&gt; Mapa_de_Problemas.exe</span>
                <span className="flex items-center gap-1 sm:gap-2 text-red-400 text-[10px] sm:text-xs shrink-0"><Activity className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" /> CRÍTICO</span>
              </div>
              <div className="p-4 sm:p-6 space-y-4 bg-slate-50">
                <div className="flex items-start justify-between border-b border-[#b3b2b2] pb-3">
                  <div className="pr-4">
                    <strong className="block text-[#062464] uppercase text-[10px] sm:text-xs mb-1">Atendimento</strong>
                    <span className="text-[#062464]/60 text-[10px] sm:text-xs">Tempo de resposta alto</span>
                  </div>
                  <AlertOctagon className="text-red-500 h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                </div>
                <div className="flex items-start justify-between border-b border-[#b3b2b2] pb-3">
                  <div className="pr-4">
                    <strong className="block text-[#062464] uppercase text-[10px] sm:text-xs mb-1">Administrativo</strong>
                    <span className="text-[#062464]/60 text-[10px] sm:text-xs">Documentos dispersos</span>
                  </div>
                  <AlertOctagon className="text-red-500 h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                </div>
                <div className="flex items-start justify-between border-b border-[#b3b2b2] pb-3">
                  <div className="pr-4">
                    <strong className="block text-[#062464] uppercase text-[10px] sm:text-xs mb-1">Leads</strong>
                    <span className="text-[#062464]/60 text-[10px] sm:text-xs">Dependência de indicações</span>
                  </div>
                  <AlertOctagon className="text-red-500 h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                </div>
                
                <div className="pt-4 mt-4 sm:mt-6 border-t-2 border-[#062464] text-center">
                  <span className="block font-bold text-[#062464] uppercase text-[10px] sm:text-xs tracking-widest mb-2">Solução Detectada</span>
                  <button 
                    onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-[#00c853] text-white py-2 px-3 sm:px-4 uppercase font-bold text-[10px] sm:text-xs flex items-center justify-center hover:bg-[#062464] transition-colors"
                  >
                    <ShieldCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Inicializar Roadmap
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* DETAILED ROADMAP PROGRESS TRACKER */}
        <section id="roadmap" className="border-b bg-white" style={{ borderColor: '#b3b2b2' }}>
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row">
            
            {/* Tracker Menu (Scrollable on Mobile) */}
            <div className="lg:w-[350px] shrink-0 bg-[#062464] text-white p-6 sm:p-8 lg:p-12 flex flex-col border-b lg:border-b-0 lg:border-r" style={{ borderColor: '#b3b2b2' }}>
              <h2 className="text-2xl sm:text-3xl font-black italic mb-6 sm:mb-8 leading-tight">O ROADMAP DE TRANSFORMAÇÃO.</h2>
              
              <div className="flex flex-row overflow-x-auto lg:flex-col gap-4 lg:gap-0 lg:space-y-4 pb-4 lg:pb-0 scrollbar-hide">
                {[
                  { num: 1, label: 'Diagnóstico' },
                  { num: 2, label: 'Administração' },
                  { num: 3, label: 'Humano' },
                  { num: 4, label: 'Marketing' },
                  { num: 5, label: 'HareBrain' }
                ].map((phase) => (
                  <button 
                    key={phase.num} 
                    onClick={() => setActivePhase(phase.num)}
                    className={`shrink-0 lg:w-full text-left flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4 group transition-all duration-300 border lg:border-none p-3 lg:p-0 rounded lg:rounded-none min-w-[120px] lg:min-w-0 ${activePhase === phase.num ? 'opacity-100 border-[#00c853] bg-white/5 lg:bg-transparent' : 'opacity-50 hover:opacity-100 border-white/20'}`}
                  >
                    <span className={`text-[10px] lg:text-sm font-mono font-bold ${activePhase === 5 && phase.num === 5 ? 'text-[#00c853]' : ''}`}>
                      Fase 0{phase.num}
                    </span>
                    <div className={`hidden lg:block h-[1px] flex-1 ${activePhase === phase.num && phase.num === 5 ? 'bg-[#00c853]' : 'bg-white'}`}></div>
                    <span className={`font-bold uppercase text-[10px] lg:text-xs tracking-wider break-words ${activePhase === 5 && phase.num === 5 ? 'text-[#00c853]' : ''}`}>
                      {phase.label}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="hidden lg:block mt-auto pt-12">
                <p className="opacity-60 font-medium text-[10px] xl:text-xs leading-relaxed uppercase tracking-widest">
                  Método: Diagnosticar &rarr; Organizar &rarr; Capacitar &rarr; Estruturar &rarr; Automatizar
                </p>
              </div>
            </div>

            {/* Content Display */}
            <div className="flex-1 bg-slate-50 min-h-[400px] lg:min-h-[600px] p-6 sm:p-8 lg:p-16 overflow-y-auto">
              
              {/* STATUS INDICATOR (MOBILE) */}
              <div className="lg:hidden mb-6 inline-flex items-center px-3 py-1 bg-[#062464] text-white font-mono text-[10px] font-bold tracking-widest uppercase">
                Etapa_Ativa: Fase 0{activePhase}
              </div>

              {/* FASE 1 */}
              <div className={`transition-opacity duration-300 ${activePhase === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <div className="mb-6 sm:mb-8 border-b-2 border-[#062464] pb-4 sm:pb-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#062464] text-white flex items-center justify-center shrink-0">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-[#b3b2b2] tracking-widest uppercase block mb-1">Módulo Estratégico</span>
                    <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-[#062464]">1: Diagnóstico da Empresa</h3>
                    <p className="text-[#062464]/80 text-sm sm:text-base leading-relaxed font-medium mt-2 max-w-2xl">
                      Elaboramos o <strong className="text-[#062464]">Mapa de Problemas da Empresa</strong>. Identificamos com precisão as falhas internas que geram desperdício e impedem a melhoria real.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6 text-[#062464]">Áreas Avaliadas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    { title: "Atendimento", items: ["Tempo de resposta", "Qualidade", "Dependência de pessoas"] },
                    { title: "Comunicação Interna", items: ["Fluxo de informações", "Registro de decisões", "Gestão de tarefas"] },
                    { title: "Administrativo", items: ["Processos", "Documentos", "Financeiro e Relatórios"] },
                    { title: "Marketing e Leads", items: ["Geração de leads", "Funil de Vendas", "Marketing Digital"] },
                    { title: "Produtividade", items: ["Organização", "Uso do tempo", "Medição de desempenho"] },
                    { title: "Tecnologia", items: ["Nível de automação", "Integração", "Erros operacionais"] }
                  ].map((area, idx) => (
                    <div key={idx} className="bg-white border p-4 sm:p-6" style={{ borderColor: '#b3b2b2' }}>
                      <strong className="block text-[#062464] mb-3 text-[10px] sm:text-xs font-bold uppercase">{area.title}</strong>
                      <ul className="space-y-2">
                        {area.items.map((item, i) => (
                          <li key={i} className="flex items-center text-[10px] sm:text-xs text-[#062464]/70 font-medium leading-tight">
                            <span className="h-1 w-1 bg-[#062464] shrink-0 rounded-full mr-2"></span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>


              {/* FASE 2 */}
              <div className={`transition-opacity duration-300 ${activePhase === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <div className="mb-6 sm:mb-8 border-b-2 border-[#062464] pb-4 sm:pb-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#062464] text-white flex items-center justify-center shrink-0">
                    <FolderTree className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-[#b3b2b2] tracking-widest uppercase block mb-1">Estruturação de Base</span>
                    <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-[#062464]">2: Organização Administrativa</h3>
                    <p className="text-[#062464]/80 text-sm sm:text-base leading-relaxed font-medium mt-2 max-w-2xl">
                      Iniciamos a ordenação. O objetivo é eliminar o caos financeiro, contratos dispersos e falta de dados.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6 text-[#062464]">Soluções Implementadas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: TrendingUp, title: "Finanças e Compras", desc: "Controle de receitas, despesas, fluxo de caixa e histórico de fornecedores." },
                    { icon: FileText, title: "Contratos e Arquivos", desc: "Repositório centralizado, controle de acesso e alertas de vencimento." },
                    { icon: CheckCircle, title: "Sistema de Aprovações", desc: "Fluxos de aprovação formais e registro auditável de decisões." },
                    { icon: Users, title: "Portal do Funcionário", desc: "Canal oficial para comunicação interna e acesso a arquivos." }
                  ].map((sol, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row bg-white border p-4 sm:p-6" style={{ borderColor: '#b3b2b2' }}>
                      <sol.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#062464] shrink-0 mb-3 sm:mb-0 sm:mr-4" />
                      <div>
                        <strong className="block text-[#062464] mb-1 sm:mb-2 text-[10px] sm:text-xs uppercase break-words">{sol.title}</strong>
                        <p className="text-[10px] sm:text-xs text-[#062464]/80 font-medium leading-relaxed">{sol.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* FASE 3 */}
              <div className={`transition-opacity duration-300 ${activePhase === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <div className="mb-6 sm:mb-8 border-b-2 border-[#062464] pb-4 sm:pb-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#062464] text-white flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-[#b3b2b2] tracking-widest uppercase block mb-1">Qualificação de Equipe</span>
                    <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-[#062464]">3: Capacitação Humana</h3>
                    <p className="text-[#062464]/80 text-sm sm:text-base leading-relaxed font-medium mt-2 max-w-2xl">
                      A tecnologia sozinha não resolve o problema. Treinamos a liderança e a linha de frente para operar em alta velocidade e profissionalismo.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6 text-[#062464]">Eixos de Treinamento:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    { title: "Comunicação & Soft Skills", items: ["Comunicação corporativa", "Escrita profissional", "Trabalho em equipe"] },
                    { title: "Gestão & Produtividade", items: ["Gestão de tempo", "Organização", "Pensamento crítico"] },
                    { title: "Atendimento & Técnica", items: ["Atendimento WhatsApp", "Gestão de conflitos", "Vendedores"] },
                    { title: "Tecnologia e Inteligência", items: ["Uso de IA", "Produtividade digital", "Engenharia de Prompts"] },
                  ].map((area, idx) => (
                    <div key={idx} className="bg-white border p-4 sm:p-6" style={{ borderColor: '#b3b2b2' }}>
                      <strong className="block text-[#062464] mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold uppercase">{area.title}</strong>
                      <ul className="space-y-2">
                        {area.items.map((item, i) => (
                          <li key={i} className="flex items-center text-[10px] sm:text-xs text-[#062464]/70 font-medium">
                            <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-[#062464] shrink-0 mr-2" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>


              {/* FASE 4 */}
              <div className={`transition-opacity duration-300 ${activePhase === 4 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <div className="mb-6 sm:mb-8 border-b-2 border-[#062464] pb-4 sm:pb-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#062464] text-white flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-[#b3b2b2] tracking-widest uppercase block mb-1">Crescimento Previsível</span>
                    <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-[#062464]">4: Estrutura de Marketing</h3>
                    <p className="text-[#062464]/80 text-sm sm:text-base leading-relaxed font-medium mt-2 max-w-2xl">
                      Casa arrumada e pessoas prontas. Implementamos agora a previsibilidade de vendas para não depender apenas de indicações.
                    </p>
                  </div>
                </div>
                
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6 text-[#062464]">Motores de Geração:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: "Automação", desc: "Campanhas automatizadas para nutrição e retenção." },
                    { label: "Criação de Conteúdo", desc: "Roteiros e copies guiados por IA." },
                    { label: "Landing Pages", desc: "Páginas de alta conversão estruturadas esteticamente." },
                    { label: "Gestão Ativa de Leads", desc: "Acompanhamento estrito de funil e métricas de Analytics." },
                  ].map((sol, idx) => (
                    <div key={idx} className="bg-white border p-4 sm:p-5" style={{ borderColor: '#b3b2b2' }}>
                      <strong className="block text-[#062464] mb-1 sm:mb-2 text-[10px] sm:text-xs uppercase break-words">{sol.label}</strong>
                      <p className="text-[10px] sm:text-xs text-[#062464]/70 font-medium leading-relaxed">{sol.desc}</p>
                    </div>
                  ))}
                </div>
              </div>


              {/* FASE 5 */}
              <div className={`transition-opacity duration-300 ${activePhase === 5 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <div className="mb-6 sm:mb-8 border-b-2 border-[#00c853] pb-4 sm:pb-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#00c853] text-[#062464] flex items-center justify-center shrink-0">
                    <Cpu className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-[#b3b2b2] tracking-widest uppercase block mb-1">Escalabilidade Definitiva</span>
                    <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-[#062464]">5: Automação Inteligente</h3>
                    <p className="text-[#062464]/80 text-sm sm:text-base leading-relaxed font-medium mt-2 max-w-2xl">
                      A empresa está pronta. Entra em cena o <strong className="text-[#00c853]">HareBrain</strong> para garantir velocidade ininterrupta.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "Atendimento Autônomo", desc: "Triagem e agendamento 24h." },
                    { title: "Automação Administrativa", desc: "Geração de relatórios sem intervenção." },
                    { title: "Integração Operacional", desc: "Redução de erros nativa via APIs dedicadas." }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#062464] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#00c853] shrink-0" />
                      <div>
                        <strong className="block font-bold uppercase text-[10px] sm:text-sm mb-1">{item.title}</strong>
                        <p className="text-[10px] sm:text-xs font-medium text-white/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 sm:mt-8 text-center bg-[#00c853]/10 border border-[#00c853] p-4 sm:p-6">
                  <span className="uppercase font-black text-[#00c853] tracking-widest block mb-1 sm:mb-2 text-xs sm:text-sm">Resultado Final</span>
                  <p className="text-[10px] sm:text-xs font-medium text-[#062464]">Crescimento sólido e operação blindada à prova de surpresas humanas.</p>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* HAREBRAIN FINAL CALL-TO-ACTION */}
        <section className="bg-[#062464] text-white py-20 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-x-0 h-[200%] w-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px sm:60px sm:60px', transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)' }}></div>
          </div>
          
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 text-center">
            
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-[#00c853] bg-[#00c853]/10 text-[#00c853] text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-8 sm:mb-12">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#00c853] mr-2 sm:mr-3 animate-ping"></span>
              Fase 5: Always-On Ready
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter mb-6 sm:mb-8">
              HARE<span className="text-[#b3b2b2]">BRAIN</span>
            </h2>
            
            <p className="text-lg sm:text-xl md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed opacity-90 mb-10 sm:mb-16">
              A tecnologia como diferencial final. Uma operação <span className="text-[#00c853] font-bold">blindada e escalável</span>. 
            </p>

            <div className="mt-8 sm:mt-12 px-2">
              <Button onClick={() => setDiagnosticOpen(true)} size="lg" className="w-full sm:w-auto rounded-none text-sm md:text-lg h-16 sm:h-20 px-8 md:px-16 font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,200,83,0.3)] sm:shadow-[0_0_40px_rgba(0,200,83,0.3)] hover:shadow-[0_0_60px_rgba(0,200,83,0.5)] transition-all" style={{ backgroundColor: '#00c853', color: '#062464' }}>
                Implantar o Método
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* PREMIUM FOOTER */}
      <footer className="bg-white border-t py-12 sm:py-16 px-4 sm:px-6" style={{ borderColor: '#b3b2b2' }}>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 border-b pb-12" style={{ borderColor: '#b3b2b2' }}>
          
          <div className="md:col-span-2 space-y-6">
            <img src="/logo_full.png" alt="HareWare" className="h-8 sm:h-10 object-contain opacity-80" />
            <p className="text-sm font-medium text-[#062464]/70 max-w-sm leading-relaxed">
              O <strong className="text-[#062464]">Método HareWare</strong> é uma transição técnica e definitiva para a escalabilidade. Da operação caótica ao organismo automatizado.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#062464] uppercase text-xs tracking-widest mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-sm font-medium text-[#062464]/70">
              <li><button onClick={() => setDiagnosticOpen(true)} className="hover:text-[#062464] transition-colors">HARE SCORE (Diagnóstico)</button></li>
              <li><button onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#062464] transition-colors">Roadmap de Método</button></li>
              <li><Link to="/privacidade" className="hover:text-[#062464] transition-colors">Privacidade e Termos</Link></li>
              <li><Link to="/login" className="hover:text-[#062464] transition-colors">Acesso ao Sistema</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#062464] uppercase text-xs tracking-widest mb-6">Nossas Redes</h4>
            <div className="flex flex-col gap-4">
              <a href="https://www.instagram.com/hareware.ai" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-[#062464]/70 hover:text-[#062464] transition-colors group">
                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center group-hover:bg-[#062464] group-hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </div>
                Instagram
              </a>
              <a href="https://www.tiktok.com/@hareware_ai?_r=1&_t=ZS-94pEfe2RCxI" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-[#062464]/70 hover:text-[#062464] transition-colors group">
                {/* Fallback to Twitter icon for TikTok if lucide doesn't have it explicitly enabled in this version */}
                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center group-hover:bg-[#062464] group-hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </div>
                TikTok
              </a>
              <a href="https://www.linkedin.com/company/hareware-solu%C3%A7%C3%B5es-tecnol%C3%B3gicas" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium text-[#062464]/70 hover:text-[#062464] transition-colors group">
                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center group-hover:bg-[#062464] group-hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                </div>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-[#062464]/50">
          <div>HareWare Soluções Tecnológicas LTDA © 2026. Todos os direitos reservados.</div>
          <div className="text-center sm:text-right">
            CNPJ: 60.871.736/0001-67<br/>
            ARARAS - SP - BRASIL
          </div>
        </div>
      </footer>
      {/* FULL-SCREEN MODAL DIAGNOSTIC */}
      <DiagnosticModal isOpen={diagnosticOpen} onClose={() => setDiagnosticOpen(false)} />
      
      {/* GLOBAL COOKIE BANNER */}
      <CookieBanner />
    </div>
  );
}
