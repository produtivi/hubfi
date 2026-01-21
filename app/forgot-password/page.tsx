'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../components/theme-toggle';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import Image from 'next/image';

export default function ForgotPassword() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('[forgot-password page] Enviando email:', email);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('[forgot-password page] Status da resposta:', response.status);
      const data = await response.json();
      console.log('[forgot-password page] Dados da resposta:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar código');
      }

      // Salvar email no sessionStorage para usar na próxima página
      sessionStorage.setItem('resetEmail', email);
      router.push('/reset-password');
    } catch (error) {
      console.error('[forgot-password page] Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao enviar código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-md">
          <div
            className="bg-card rounded-lg p-8 shadow-sm dark:shadow-lg"
            style={{ border: resolvedTheme === 'dark' ? '1px solid #3A3A3A' : '1px solid #D1D5DB' }}
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-headline">Recuperar senha</h1>
                <ThemeToggle />
              </div>
              <p className="text-body-muted mt-2">
                Digite seu email para receber um código de recuperação
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-label font-medium">Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  placeholder="seu@email.com"
                  isRequired
                />
              </div>

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isDisabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-label text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar para o login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Logo */}
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
