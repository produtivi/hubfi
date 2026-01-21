'use client';

import { useState } from 'react';
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
  const [error, setError] = useState('');

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
            style={{ border: resolvedTheme === 'dark' ? '1px solid #3A3A3A' : '1px solid #D1D5DB' }}
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
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

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
