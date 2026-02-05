'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../components/theme-toggle';
import Image from 'next/image';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Usar tema light como padrão para evitar hydration mismatch
  const theme = mounted ? resolvedTheme : 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      // Conta criada com sucesso e usuário já logado automaticamente
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/google/login');
      const data = await response.json();

      if (!response.ok || !data.authUrl) {
        throw new Error(data.error || 'Erro ao gerar URL de login');
      }

      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com Google');
      setIsGoogleLoading(false);
    }
  };

  const anyLoading = isLoading || isGoogleLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-md">
          <div
            className="bg-card rounded-lg p-8 shadow-sm dark:shadow-lg"
            style={{ border: theme === 'dark' ? '1px solid #3A3A3A' : '1px solid #D1D5DB' }}
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-headline">Criar conta</h1>
                <ThemeToggle />
              </div>
              <p className="text-body-muted mt-2">
                Preencha os dados para começar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={anyLoading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-6 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-label">
                  <span className="px-3 bg-card text-muted-foreground">ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={anyLoading}
                className="w-full h-11 rounded-md border border-border bg-background px-4 text-body font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isGoogleLoading ? 'Conectando...' : 'Criar conta com Google'}
              </button>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-label text-muted-foreground hover:text-foreground transition-colors"
              >
                Já tem uma conta?{' '}
                <span className="text-foreground font-medium">Fazer login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Logo (inverted theme for contrast) */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative"
        style={{
          backgroundColor: theme === 'dark' ? '#FFFFFF' : '#000000',
          boxShadow: theme === 'dark'
            ? '-12px 0 40px rgba(0,0,0,0.3)'
            : '-12px 0 40px rgba(255,255,255,0.15)'
        }}
      >
        <div className="w-full max-w-md px-8 text-center">
          <Image
            src={theme === 'dark' ? '/logo/logo-preta.png' : '/logo/logo-branca.png'}
            alt="Hubfi"
            width={400}
            height={120}
            className="w-full h-auto mb-4"
            priority
          />
          <p
            className="text-title"
            style={{ color: theme === 'dark' ? '#181818' : '#E5E5E5' }}
          >
            Tudo que você precisa em um só lugar
          </p>
        </div>
      </div>
    </div>
  );
}
