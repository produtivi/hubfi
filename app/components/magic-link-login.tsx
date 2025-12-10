'use client';

import { useState } from 'react';
import type { MagicLinkRequest, MagicLinkVerification } from '../types/auth';

interface MagicLinkLoginProps {
  onRequestCode: (request: MagicLinkRequest) => Promise<void>;
  onVerifyCode: (verification: MagicLinkVerification) => Promise<void>;
}

export function MagicLinkLogin({ onRequestCode, onVerifyCode }: MagicLinkLoginProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onRequestCode({ email });
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onVerifyCode({ email, code });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCodeSent(false);
    setCode('');
    setError('');
  };

  if (!codeSent) {
    return (
      <form onSubmit={handleRequestCode} className="space-y-4">
        <div>
          <label htmlFor="magic-email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="magic-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="seu@email.com"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enviando...' : 'Enviar código'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div className="rounded-md bg-accent p-3 text-sm text-foreground">
        Código enviado para <strong>{email}</strong>
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-foreground">
          Código de verificação
        </label>
        <input
          id="code"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-center text-lg tracking-widest"
          placeholder="000000"
          maxLength={6}
          disabled={isLoading}
          autoFocus
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 rounded-md border border-border px-4 py-2 text-foreground font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
    </form>
  );
}
