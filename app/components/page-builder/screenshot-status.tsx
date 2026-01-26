'use client';

import { useState, useEffect } from 'react';
import { RefreshCw05, CheckCircle, XCircle } from '@untitledui/icons';

interface PreviewStatusProps {
  presellId: number;
  onComplete?: () => void;
}

export function ScreenshotStatus({ presellId, onComplete }: PreviewStatusProps) {
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 20; // 20 tentativas = 40 segundos (polling a cada 2s)

    // Simular progresso visual enquanto processa
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Parar em 90% até completar
        return prev + Math.random() * 15; // Incremento variável para parecer natural
      });
    }, 500);

    // Polling para verificar status real
    const checkStatus = async () => {
      try {
        attempts++;

        const response = await fetch(`/api/presells/${presellId}/screenshot-status`);
        const data = await response.json();

        if (data.success && !data.data.isProcessing) {
          setProgress(100);

          // Verificar se as prévias foram geradas com sucesso ou falharam
          if (data.data.screenshotDesktop && data.data.screenshotMobile) {
            setStatus('completed');
          } else {
            // Prévias são null = falha
            setStatus('failed');
          }

          clearInterval(pollInterval);
          clearInterval(progressInterval);

          // Aguardar animação completar
          setTimeout(() => {
            onComplete?.();
          }, 1000);
        } else if (attempts >= maxAttempts) {
          // Timeout - considerado falha
          setStatus('failed');
          clearInterval(pollInterval);
          clearInterval(progressInterval);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
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
  }, [presellId, onComplete]);

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="w-4 h-4" />
        <span className="text-label">Prévias prontas</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="w-4 h-4" />
        <span className="text-label">Falha ao gerar prévias</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw05 className="w-4 h-4 animate-spin" />
        <span className="text-label">Gerando prévias...</span>
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
