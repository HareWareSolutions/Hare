import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Database, Lock } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-[#062464] font-sans selection:bg-[#00c853]/20">
      
      {/* HEADER */}
      <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#b3b2b2]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo_full.png" alt="HareWare" className="h-8 sm:h-12 object-contain" />
          </Link>
          <Button asChild variant="ghost" className="text-[#062464] font-bold uppercase tracking-widest text-xs hover:bg-slate-100">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
        <div className="mb-12 border-b-4 border-[#00c853] pb-6 inline-block">
          <div className="inline-flex items-center px-3 py-1 bg-[#062464] text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Políticas Oficiais HareWare
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic leading-[1.05] tracking-tighter text-[#062464]">
            TERMOS DE USO E <br/>
            <span className="text-[#00c853]">PRIVACIDADE</span>
          </h1>
          <p className="text-sm font-bold text-[#b3b2b2] tracking-widest uppercase mt-4">
            Última Atualização: Março de 2026
          </p>
        </div>

        <div className="space-y-12 text-[#062464]/80 text-sm sm:text-base leading-relaxed font-medium">
          
          <section className="bg-white p-6 sm:p-8 border border-[#b3b2b2] shadow-sm">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#b3b2b2]">
              <ShieldCheck className="h-8 w-8 text-[#00c853]" />
              <h2 className="text-xl sm:text-2xl font-black italic uppercase text-[#062464]">1. Introdução</h2>
            </div>
            <p className="mb-4">
              A <strong>HareWare Soluções Tecnológicas LTDA</strong> tem o compromisso de respeitar e resguardar a sua privacidade e a segurança dos dados da sua empresa. Esta política esclarece nossas práticas de acordo com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei n° 13.709/2018)</strong>.
            </p>
            <p>
              Ao utilizar nosso site, plataforma ou preencher o nosso formulário de <strong>Auto Diagnóstico (HARE SCORE)</strong>, você concorda ativamente com as práticas descritas nestes termos.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#b3b2b2] shadow-sm">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#b3b2b2]">
              <Database className="h-8 w-8 text-[#00c853]" />
              <h2 className="text-xl sm:text-2xl font-black italic uppercase text-[#062464]">2. Coleta de Dados e HARE SCORE</h2>
            </div>
            <p className="mb-4">
              Durante o preenchimento do nosso formulário de Auto Diagnóstico (HARE SCORE), capturamos livremente informações de perfil da sua empresa sob o seu consentimento.
            </p>
            <h3 className="font-bold text-[#062464] text-xs uppercase tracking-widest mt-6 mb-2">Dados coletados:</h3>
            <ul className="list-disc list-inside space-y-2 mb-6 ml-2">
              <li>Nome da Empresa e Nome do Responsável (opcional)</li>
              <li>Quantidade de Colaboradores</li>
              <li>E-mail Profissional e Telefone Celular (WhatsApp)</li>
              <li>Avaliação situacional de 6 áreas operacionais.</li>
            </ul>
            <h3 className="font-bold text-[#062464] text-xs uppercase tracking-widest mt-6 mb-2">Finalidade do Processamento:</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Cálculo em tempo real do Score de Maturidade da empresa usando nossos algoritmos.</li>
              <li>Criação do seu perfil em nosso banco de dados corporativo na condição de <strong>Lead (Potencial Cliente)</strong>.</li>
              <li>Contato futuro pelos nossos consultores operacionais via telefone/email ou convites de roadmap de automação, baseado no nível das fragilidades expostas na pontuação final.</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#b3b2b2] shadow-sm">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#b3b2b2]">
              <Lock className="h-8 w-8 text-[#00c853]" />
              <h2 className="text-xl sm:text-2xl font-black italic uppercase text-[#062464]">3. Uso de Cookies</h2>
            </div>
            <p className="mb-4">
              O ecossistema HareWare utiliza <strong>Cookies Essenciais</strong> (necessários para segurança do sistema e persistência do banner de aceitação) e <strong>Cookies Analíticos</strong> para mapear o comportamento de engajamento no site.
            </p>
            <p>
              Os dados de cookies <strong>não compartilham dados sensíveis pessoais</strong> e servem unicamente para estruturar melhor a escalabilidade de nossa infraestrutura visual. Você tem o pleno direito de rejeitá-los usando o nosso aviso de consentimento ou reconfigurá-los em seu navegador de origens.
            </p>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#b3b2b2] shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black italic uppercase text-[#062464] mb-4 pb-4 border-b border-[#b3b2b2]">4. Compartilhamento e Direitos</h2>
            <p className="mb-4">
              A HareWare <strong>NÃO VARRE, NÃO VENDE, NÃO COMPARTILHA E NÃO ALUGARÁ</strong> os dados da sua operação com corretores de dados de terceiros em nenhuma hipótese. Todos os dados colhidos do HARE SCORE são criptografados no banco e visualizados restritamente por <strong>Superadmins Autenticados</strong> internos.
            </p>
            <p>
              Sob as bases da LGPD Brasileira, qualquer usuário pode requerer, a qualquer dia:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-2">
              <li>A confirmação do banco de dados contendo o seu preenchimento;</li>
              <li>A revisão e atualização de qualquer linha em nossos registros;</li>
              <li>A exclusão permanente, integral e irrecuperável do lead em nosso sistema (Direito de ser esquecido).</li>
            </ul>
            <p className="mt-6 font-bold text-[#062464]">
              Para solicitações oficiais ligadas a dados, contatar pelo e-mail: <a href="mailto:contato@hareware.com.br" className="text-[#00c853] underline hover:text-[#062464]">contato@hareware.com.br</a>.
            </p>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-8 px-4 sm:px-6 mt-12" style={{ borderColor: '#b3b2b2' }}>
        <div className="max-w-[1000px] mx-auto text-center flex flex-col justify-center items-center gap-4">
          <img src="/logo_full.png" alt="HareWare" className="h-6 sm:h-8 object-contain grayscale opacity-60 mb-2 mt-4" />
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#062464]/50 text-center">
            HareWare Soluções Tecnológicas LTDA © 2026. <br/>
            CNPJ: 60.871.736/0001-67 | ARARAS - SP
          </div>
        </div>
      </footer>

    </div>
  );
}
