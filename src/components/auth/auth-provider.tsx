// TODO: Implement auth provider

'use client';

import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: unknown | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Implement auth provider logic
  const value = {
    user: null,
    isLoading: false,
    signIn: async () => {
      throw new Error('Not implemented');
    },
    signOut: async () => {
      throw new Error('Not implemented');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
