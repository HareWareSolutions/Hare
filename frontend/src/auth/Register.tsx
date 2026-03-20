import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        email,
        password,
        full_name: fullname,
        company_name: companyName
      });
      
      toast.success('Cadastro realizado com sucesso! Faça login.');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao cadastrar. O email já pode estar em uso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#062464 1px, transparent 1px), linear-gradient(90deg, #062464 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <Card className="w-full max-w-md relative z-10 border-2 border-primary shadow-xl p-2">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-border mb-6">
          <div className="flex justify-center mb-4">
            <img src="/logo_full.png" alt="Hare Logo" className="h-10 sm:h-12 object-contain" />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-primary">Nova Operação</CardTitle>
          <CardDescription className="font-medium text-primary/70 uppercase text-[10px] tracking-widest">
            Registre sua empresa no sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-primary">Nome da Empresa</Label>
              <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-slate-50 focus:border-accent focus:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-xs font-bold uppercase tracking-wider text-primary">Seu Nome</Label>
              <Input id="fullname" required value={fullname} onChange={(e) => setFullname(e.target.value)} className="bg-slate-50 focus:border-accent focus:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-primary">Email Corporativo</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 focus:border-accent focus:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-primary">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-50 focus:border-accent focus:ring-accent" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-5 pt-4">
            <Button className="w-full h-14 text-xs sm:text-sm bg-primary text-white hover:bg-accent hover:text-primary transition-colors" type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Inicializar Operação'}
            </Button>
            <div className="text-[10px] text-center text-primary/60 font-bold uppercase tracking-widest">
              Já possui conta?{' '}
              <Link to="/login" className="text-accent hover:text-primary transition-colors underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
