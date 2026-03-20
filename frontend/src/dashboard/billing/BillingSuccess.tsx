import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BillingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // In a real app, you might want to verify the session_id with your backend here
    // before showing success, or you rely entirely on the webhook.
    console.log("Stripe Session ID:", sessionId);
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
      <div className="p-4 rounded-full bg-green-500/20 text-green-500">
        <CheckCircle2 className="w-16 h-16" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Assinatura Confirmada!</h1>
        <p className="text-muted-foreground max-w-[500px] text-lg">
          Seu pagamento foi processado com sucesso. Bem-vindo ao seu novo plano da HareWare.
        </p>
      </div>

      <div className="pt-4">
        <Button 
          size="lg" 
          onClick={() => navigate('/dashboard')}
          className="bg-primary hover:bg-primary/90"
        >
          Acessar meu Dashboard
        </Button>
      </div>
    </div>
  );
}
