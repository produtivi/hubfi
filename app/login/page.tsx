'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { TraditionalLogin } from '../components/traditional-login';
import { UserProvider } from '../hooks/use-user';
import { ThemeToggle } from '../components/theme-toggle';
import Image from 'next/image';
import type { LoginCredentials } from '../types/auth';

function LoginContent() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

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
          <div
              className="bg-card rounded-lg p-8 shadow-sm dark:shadow-lg"
              style={{ border: resolvedTheme === 'dark' ? '1px solid #3A3A3A' : '1px solid #D1D5DB' }}
            >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-headline">Entrar</h1>
                <ThemeToggle />
              </div>
              <p className="text-body-muted mt-2">
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

      {/* Right side - Logo (inverted theme for contrast) */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? '#FFFFFF' : '#000000',
          boxShadow: resolvedTheme === 'dark'
            ? '-12px 0 40px rgba(0,0,0,0.3)'
            : '-12px 0 40px rgba(255,255,255,0.15)'
        }}
      >
        <div className="w-full max-w-md px-8 text-center">
          <Image
            src={resolvedTheme === 'dark' ? '/logo/logo-preta.png' : '/logo/logo-branca.png'}
            alt="Hubfi"
            width={400}
            height={120}
            className="w-full h-auto mb-4"
            priority
          />
          <p
            className="text-title"
            style={{ color: resolvedTheme === 'dark' ? '#181818' : '#E5E5E5' }}
          >
            Tudo que você precisa em um só lugar
          </p>
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
