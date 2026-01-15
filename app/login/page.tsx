'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TraditionalLogin } from '../components/traditional-login';
import { MagicLinkLogin } from '../components/magic-link-login';
import { UserProvider, useUser } from '../hooks/use-user';
import type { LoginCredentials, MagicLinkRequest, MagicLinkVerification, LoginMethod } from '../types/auth';

function LoginContent() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('traditional');

  const handleTraditionalLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Login bem-sucedido, redirecionar
      router.push('/');
    } catch (error) {
      // Re-throw para que o componente TraditionalLogin possa tratar
      throw error;
    }
  };

  const handleRequestCode = async (request: MagicLinkRequest) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleVerifyCode = async (verification: MagicLinkVerification) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-8">
            Bem-vindo ao Hubfi
          </h1>

          {loginMethod === 'traditional' ? (
            <TraditionalLogin onSubmit={handleTraditionalLogin} />
          ) : (
            <MagicLinkLogin
              onRequestCode={handleRequestCode}
              onVerifyCode={handleVerifyCode}
            />
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Não tem uma conta ainda?{' '}
              <button 
                onClick={() => router.push('/register')}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <LoginContent />
    </UserProvider>
  );
}
