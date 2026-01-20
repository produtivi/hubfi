'use client';

import { useRouter } from 'next/navigation';
import { TraditionalLogin } from '../components/traditional-login';
import { UserProvider } from '../hooks/use-user';
import Image from 'next/image';
import type { LoginCredentials } from '../types/auth';

function LoginContent() {
  const router = useRouter();

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

      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm dark:shadow-lg dark:border-[#3A3A3A]">
            <div className="mb-8">
              <h1 className="text-headline mb-2">Entrar</h1>
              <p className="text-body-muted">
                Acesse sua conta para continuar
              </p>
            </div>

            <TraditionalLogin onSubmit={handleTraditionalLogin} />

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/register')}
                className="text-label text-muted-foreground hover:text-foreground transition-colors"
              >
                Não tem uma conta?{' '}
                <span className="text-foreground font-medium">Criar conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Logo (always inverted theme for contrast) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative bg-[#0A0A0A] dark:bg-[#FAFAFA] shadow-[-12px_0_40px_rgba(255,255,255,0.15)] dark:shadow-[-12px_0_40px_rgba(0,0,0,0.3)]">

        <div className="w-full max-w-md px-8 text-center">
          {/* Light mode: black background with white logo */}
          <div className="dark:hidden">
            <Image
              src="/logo/logo-branca.png"
              alt="Hubfi"
              width={400}
              height={120}
              className="w-full h-auto mb-4"
              priority
            />
            <p className="text-title text-[#E5E5E5]">
              Tudo que você precisa em um só lugar
            </p>
          </div>

          {/* Dark mode: white background with black logo */}
          <div className="hidden dark:block">
            <Image
              src="/logo/logo-preta.png"
              alt="Hubfi"
              width={400}
              height={120}
              className="w-full h-auto mb-4"
              priority
            />
            <p className="text-title text-[#181818]">
              Tudo que você precisa em um só lugar
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
