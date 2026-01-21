'use client';

import { useAuth } from '../hooks/use-auth';
import { usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Não ativa o auth em rotas públicas
  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

  // Ativa o sistema de refresh automático apenas em rotas protegidas
  if (!isPublicRoute) {
    useAuth();
  }

  return <>{children}</>;
}
