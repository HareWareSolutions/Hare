import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './lib/store';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { Overview } from './dashboard/Overview';
import { ClientsList } from './clients/ClientsList';
import { ServicesList } from './services/ServicesList';
import { UsersManager } from './users/UsersManager';
import { AdminPanel } from './admin/AdminPanel';
import { BillingSuccess } from './dashboard/billing/BillingSuccess';
import { BillingCancel } from './dashboard/billing/BillingCancel';
import { LandingPage } from './landing/LandingPage';
import { PrivacyPage } from './landing/PrivacyPage';
import { DiagnosticsList } from './admin/DiagnosticsList';
import { FinancePanel } from './finance/FinancePanel';
import { RolesManager } from '@/admin/RolesManager';
import { DocumentsPanel } from './documents/DocumentsPanel';
import { AssignmentsPanel } from './assignments/AssignmentsPanel';
import { SalesPanel } from './sales/SalesPanel';
import { Toaster } from 'sonner';

function ProtectedRoute({ children, superuserOnly = false }: { children: React.ReactNode, superuserOnly?: boolean }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (superuserOnly && user && !user.is_superuser) {
     return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="clients" element={<ClientsList />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="finance" element={<FinancePanel />} />
          <Route path="documents" element={<DocumentsPanel />} />
          <Route path="assignments" element={<AssignmentsPanel />} />
          <Route path="sales" element={<SalesPanel />} />
          <Route path="roles" element={<RolesManager />} />
          <Route path="billing/success" element={<BillingSuccess />} />
          <Route path="billing/cancel" element={<BillingCancel />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute superuserOnly><DashboardLayout /></ProtectedRoute>}>
           <Route index element={<AdminPanel />} />
           <Route path="diagnostics" element={<DiagnosticsList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
