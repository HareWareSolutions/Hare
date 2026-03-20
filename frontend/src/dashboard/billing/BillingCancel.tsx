import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BillingCancel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
      <div className="p-4 rounded-full bg-destructive/20 text-destructive">
        <XCircle className="w-16 h-16" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Pagamento Cancelado</h1>
        <p className="text-muted-foreground max-w-[500px] text-lg">
          Você cancelou o processo de assinatura. Nenhuma cobrança foi realizada.
        </p>
      </div>

      <div className="pt-4 flex items-center space-x-4">
        <Button 
          variant="outline"
          size="lg" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        {/* We assume there is a plans page or a modal to reopen the process */}
        <Button 
          size="lg" 
          onClick={() => navigate('/dashboard')} 
          className="bg-primary hover:bg-primary/90"
        >
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
