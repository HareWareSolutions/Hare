import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { LayoutDashboard, Users, Briefcase, LogOut, Shield, UserPlus, DollarSign, ShieldCheck, FileText, CheckSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/lib/permissions';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
    { name: 'Vendas', path: '/dashboard/sales', icon: TrendingUp, permission: 'sales.read', module: 'sales' },
    { name: 'Clientes', path: '/dashboard/clients', icon: Users, permission: 'clients.read', module: 'crm' },
    { name: 'Serviços', path: '/dashboard/services', icon: Briefcase, permission: 'services.read', module: 'crm' },
    { name: 'Usuários', path: '/dashboard/users', icon: UserPlus, permission: 'users.read' },
    { name: 'Financeiro', path: '/dashboard/finance', icon: DollarSign, permission: 'finance.read', module: 'finance' },
    { name: 'Documentos', path: '/dashboard/documents', icon: FileText, permission: 'documents.read', module: 'documents' },
    { name: 'Atribuições', path: '/dashboard/assignments', icon: CheckSquare, permission: 'assignments.read', module: 'assignments' },
    { name: 'Cargos', path: '/dashboard/roles', icon: ShieldCheck, permission: 'roles.manage' },
  ];

  const { hasPermission } = useHasPermission();
  
  const navItems = allNavItems.filter(item => {
    // Check permission first
    if (!hasPermission(item.permission)) return false;
    
    // If it's a superuser, they see everything they have permission for
    if (user?.is_superuser) return true;
    
    // If item is linked to a module, check if company has it
    if (item.module) {
      if (!user?.company?.modules || user.company.modules.length === 0) return true;
      return user.company.modules.includes(item.module);
    }
    
    return true;
  });

  if (user?.is_superuser) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield, permission: 'admin.access' });
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-primary bg-white flex flex-col hidden md:flex shrink-0 z-20 shadow-[4px_0_24px_rgba(6,36,100,0.05)]">
        <div className="h-20 flex items-center px-6 border-b-2 border-primary bg-slate-50">
          <img src="/logo_full.png" alt="Hare Logo" className="h-8 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/dashboard' 
                  ? location.pathname === item.path
                  : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-xs uppercase tracking-widest font-bold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md translate-x-1' 
                    : 'text-primary/60 hover:bg-slate-100 hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t-2 border-primary bg-slate-50">
          <Button variant="ghost" className="w-full justify-start text-primary/60 hover:bg-red-50 hover:text-red-600 rounded-none uppercase text-xs tracking-widest font-bold" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-3" />
            Encerrar Sessão
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 relative">
        {/* Topbar */}
        <header className="h-20 border-b-2 border-primary bg-white flex items-center justify-between px-6 shrink-0 relative z-10 shadow-sm">
          <div className="md:hidden">
            <img src="/logo_full.png" alt="Hare Logo" className="h-8 object-contain" />
          </div>
          <div className="ml-auto flex items-center space-x-4">
             <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase font-bold tracking-widest text-[#00c853] bg-green-50 px-2 py-1 border border-[#00c853]">Online</span>
               <span className="text-xs font-black uppercase tracking-wider text-primary">
                 {user?.full_name || user?.email || 'Operador'}
               </span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 relative">
          <div className="absolute inset-x-0 top-0 h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#062464 1px, transparent 1px), linear-gradient(90deg, #062464 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
