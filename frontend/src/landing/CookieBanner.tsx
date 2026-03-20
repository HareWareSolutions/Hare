import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('hareware_cookie_consent');
    if (!consent) {
      // Small delay to make it pop in nicely
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('hareware_cookie_consent', 'true');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('hareware_cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 sm:pb-8 flex justify-center animate-in slide-in-from-bottom-10 duration-700 pointer-events-none">
      <div className="bg-white border-2 border-[#062464] shadow-2xl p-5 sm:p-6 max-w-4xl w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto relative">
        <button 
          onClick={declineCookies}
          className="absolute top-2 right-2 p-2 text-[#b3b2b2] hover:text-[#062464] transition-colors md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#062464] text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#062464] text-sm sm:text-base uppercase tracking-widest mb-1">Privacidade e Cookies</h3>
            <p className="text-xs sm:text-sm text-[#062464]/80 font-medium leading-relaxed max-w-xl">
              Utilizamos cookies e tecnologias semelhantes para processar dados durante seu diagnóstico empresarial, melhorando a experiência e segurança do <strong>HareBrain</strong>. Ao continuar, você concorda com nossos <Link to="/privacidade" className="font-bold underline text-[#00c853] hover:text-[#062464] transition-colors">Termos de Uso e Privacidade</Link> sob os pilares da LGPD.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Button onClick={declineCookies} variant="outline" className="rounded-none bg-white hover:bg-slate-100 border-2 border-[#062464] text-[#062464] hover:text-[#062464] font-bold uppercase tracking-wider h-12 px-6">
            Recusar
          </Button>
          <Button onClick={acceptCookies} className="rounded-none bg-[#00c853] hover:bg-[#062464] text-white font-bold uppercase tracking-wider h-12 px-8">
            Aceitar Termos
          </Button>
        </div>
      </div>
    </div>
  );
}
