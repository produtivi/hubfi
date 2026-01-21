'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../components/theme-toggle';
import { VerificationCodeInput } from '../components/base/input/verification-code-input';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Check } from 'lucide-react';
import Image from 'next/image';

type Step = 'code' | 'password';

export default function ResetPassword() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<Step>('code');

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/forgot-password');
    }
  }, [router]);

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Verificar se o código é válido
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      // Código válido, ir para o passo de senha
      setStep('password');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          code,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }

      sessionStorage.removeItem('resetEmail');
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Erro ao reenviar código');
      }

      setCode('');
      setSuccess('Novo código enviado para seu email');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao reenviar código');
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
                <h1 className="text-headline">
                  {step === 'code' ? 'Verificar código' : 'Nova senha'}
                </h1>
                <ThemeToggle />
              </div>
              <p className="text-body-muted mt-2">
                {step === 'code'
                  ? `Digite o código enviado para ${email}`
                  : 'Digite sua nova senha'
                }
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-6">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-accent border border-border rounded-md mb-6 flex items-center justify-between">
                <p className="text-foreground text-sm">{success}</p>
                <Check className="w-4 h-4 text-foreground" />
              </div>
            )}

            {step === 'code' ? (
              <div className="space-y-6">
                <VerificationCodeInput
                  value={code}
                  onChange={setCode}
                  isDisabled={isLoading}
                  isError={!!error}
                />

                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleVerifyCode}
                  isDisabled={isLoading || code.length !== 6}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Verificar código'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-label text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    Não recebeu? <span className="font-medium">Reenviar código</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-label font-medium">Nova senha</span>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(value) => setNewPassword(value)}
                    placeholder="Mínimo 6 caracteres"
                    isRequired
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-label font-medium">Confirmar nova senha</span>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(value) => setConfirmPassword(value)}
                    placeholder="Repita a nova senha"
                    isRequired
                  />
                </div>

                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleResetPassword}
                  isDisabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
                </Button>
              </div>
            )}

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
