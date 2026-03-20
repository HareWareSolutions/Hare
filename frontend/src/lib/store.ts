import { create } from 'zustand';
import { api } from './api';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  company_id: string;
  is_superuser: boolean;
  roles: Role[];
  company?: {
    id: string;
    name: string;
    modules: string[];
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data });
    } catch (err: any) {
      // If unauthorized, logout
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      }
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
