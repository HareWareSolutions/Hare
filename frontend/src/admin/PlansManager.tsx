import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stripe_price_id: string | null;
  features: string[];
  is_active: boolean;
}

export function PlansManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0.0');
  const [stripePriceId, setStripePriceId] = useState('');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/admin/plans');
      setPlans(res.data);
    } catch (err) {
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setDescription(plan.description || '');
      setPrice(plan.price.toString());
      setStripePriceId(plan.stripe_price_id || '');
      setFeatures(plan.features?.join(', ') || '');
      setIsActive(plan.is_active);
    } else {
      setEditingPlan(null);
      setName('');
      setDescription('');
      setPrice('0.0');
      setStripePriceId('');
      setFeatures('');
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      name,
      description,
      price: parseFloat(price),
      stripe_price_id: stripePriceId || null,
      features: features.split(',').map(f => f.trim()).filter(f => f.length > 0),
      is_active: isActive
    };

    try {
      if (editingPlan) {
        await api.put(`/admin/plans/${editingPlan.id}`, planData);
        toast.success('Plano atualizado com sucesso!');
      } else {
        await api.post('/admin/plans', planData);
        toast.success('Plano criado com sucesso!');
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error('Erro ao salvar plano');
    }
  };

  const toggleStatus = async (plan: Plan) => {
    try {
      await api.put(`/admin/plans/${plan.id}`, { is_active: !plan.is_active });
      toast.success(`Plano ${!plan.is_active ? 'ativado' : 'inativado'} com sucesso!`);
      fetchPlans();
    } catch (err) {
      toast.error('Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b-2 border-primary pb-4 mb-4">
        <h3 className="text-2xl font-black italic uppercase text-primary">Gestão de Planos</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" /> Novo Plano</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Editar Plano' : 'Criar Plano'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço Base (R$)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Button type="button" variant="outline" className="w-full justify-between" onClick={() => setIsActive(!isActive)}>
                    {isActive ? 'Ativo' : 'Inativo'}
                    {isActive ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                <Input id="stripePriceId" value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_1NXXXX..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (separadas por vírgula)</Label>
                <Input id="features" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Até 5 usuários, Suporte prioritário..." />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">{editingPlan ? 'Atualizar' : 'Criar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Stripe ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : plans.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum plano cadastrado.</TableCell></TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.name}
                    <div className="text-xs text-muted-foreground">{plan.features?.length || 0} features</div>
                  </TableCell>
                  <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{plan.stripe_price_id || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'} className={plan.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(plan)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(plan)}>
                      {plan.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
