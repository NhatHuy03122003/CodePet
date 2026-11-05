// TODO: Implement auth store

import { create } from 'zustand';

interface AuthState {
  user: unknown | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: unknown | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
