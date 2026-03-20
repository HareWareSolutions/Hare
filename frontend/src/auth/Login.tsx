import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      setToken(response.data.access_token);
      toast.success('Login bem-sucedido!');
      navigate('/dashboard');
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (detail === 'Inactive user') {
        toast.error('Sua conta ainda não foi aprovada pelo administrador. Aguarde o contato ou aprovação.');
      } else if (detail === 'Incorrect email or password') {
        toast.error('Usuário ou senha incorretos, ou a conta ainda não existe.');
      } else {
        toast.error('Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#062464 1px, transparent 1px), linear-gradient(90deg, #062464 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <Card className="w-full max-w-md relative z-10 border-2 border-primary shadow-xl p-2">
        <CardHeader className="space-y-2 text-center pb-8 border-b border-border mb-6">
          <div className="flex justify-center mb-4">
            <img src="/logo_full.png" alt="Hare Logo" className="h-10 sm:h-12 object-contain" />
          </div>
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-primary">Conta SaaS</CardTitle>
          <CardDescription className="font-medium text-primary/70 uppercase text-xs tracking-widest">
            Acesse o Painel Operacional
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-primary">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@exemplo.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 focus:border-accent focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-primary">Senha</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 focus:border-accent focus:ring-accent"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-6">
            <Button className="w-full h-14 text-sm bg-accent text-primary hover:bg-primary hover:text-white transition-colors" type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar na Operação'}
            </Button>
            <div className="text-[10px] text-center text-primary/60 font-bold uppercase tracking-widest">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-accent hover:text-primary transition-colors underline">
                Cadastre sua empresa
              </Link>

            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
