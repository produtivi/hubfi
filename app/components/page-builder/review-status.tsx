'use client';

import { useState, useEffect } from 'react';
import { RefreshCw05, CheckCircle, XCircle } from '@untitledui/icons';

interface ReviewStatusProps {
  reviewId: number;
  onComplete?: () => void;
}

export function ReviewStatus({ reviewId, onComplete }: ReviewStatusProps) {
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 30; // 30 tentativas = 60 segundos (polling a cada 2s)

    // Simular progresso visual enquanto processa
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Parar em 90% até completar
        return prev + Math.random() * 10; // Incremento variável para parecer natural
      });
    }, 800);

    // Polling para verificar status real
    const checkStatus = async () => {
      try {
        attempts++;

        const response = await fetch(`/api/reviews/${reviewId}/status`);
        const data = await response.json();

        if (data.success && data.data.status === 'published') {
          setProgress(100);
          setStatus('completed');

          clearInterval(pollInterval);
          clearInterval(progressInterval);

          // Aguardar animação completar
          setTimeout(() => {
            onComplete?.();
          }, 1000);
        } else if (data.data.status === 'failed') {
          setStatus('failed');
          clearInterval(pollInterval);
          clearInterval(progressInterval);
        } else if (attempts >= maxAttempts) {
          // Timeout - considerado falha
          setStatus('failed');
          clearInterval(pollInterval);
          clearInterval(progressInterval);
        }
      } catch (error) {
        console.error('Erro ao verificar status do review:', error);
        if (attempts >= maxAttempts) {
          setStatus('failed');
          clearInterval(pollInterval);
          clearInterval(progressInterval);
        }
      }
    };

    // Primeira verificação imediata
    checkStatus();

    // Polling a cada 2 segundos
    pollInterval = setInterval(checkStatus, 2000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(progressInterval);
    };
  }, [reviewId, onComplete]);

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="w-4 h-4" />
        <span className="text-label">Página pronta</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="w-4 h-4" />
        <span className="text-label">Falha ao gerar página</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw05 className="w-4 h-4 animate-spin" />
        <span className="text-label">Gerando conteúdo com IA...</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <span className="text-label text-muted-foreground">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
