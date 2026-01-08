'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TraditionalLogin } from '../components/traditional-login';
import { MagicLinkLogin } from '../components/magic-link-login';
import type { LoginCredentials, MagicLinkRequest, MagicLinkVerification, LoginMethod } from '../types/auth';

export default function Home() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('traditional');

  const handleTraditionalLogin = async (credentials: LoginCredentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/');
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

          <div className="flex gap-2 mb-6 bg-accent p-1 rounded-lg">
            <button
              onClick={() => setLoginMethod('traditional')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${loginMethod === 'traditional'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Login tradicional
            </button>
            <button
              onClick={() => setLoginMethod('magic-link')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${loginMethod === 'magic-link'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Login rápido
            </button>
          </div>

          {loginMethod === 'traditional' ? (
            <TraditionalLogin onSubmit={handleTraditionalLogin} />
          ) : (
            <MagicLinkLogin
              onRequestCode={handleRequestCode}
              onVerifyCode={handleVerifyCode}
            />
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {loginMethod === 'traditional'
            ? 'Ou tente o login rápido para acessar sem senha'
            : 'Cole o código enviado para seu email'
          }
        </p>
      </div>
    </div>
  );
}
