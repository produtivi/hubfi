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

          {loginMethod === 'traditional' ? (
            <TraditionalLogin onSubmit={handleTraditionalLogin} />
          ) : (
            <MagicLinkLogin
              onRequestCode={handleRequestCode}
              onVerifyCode={handleVerifyCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
