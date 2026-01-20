import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutos (antes do access token expirar)
const CHECK_ACTIVITY_INTERVAL = 60 * 1000; // Verifica atividade a cada 1 minuto

export function useAuth() {
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Atualiza timestamp de atividade
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido - redireciona para login
          clearInterval(refreshIntervalRef.current!);
          clearInterval(activityCheckRef.current!);
          router.push('/login');
          return false;
        }
        throw new Error('Falha ao renovar token');
      }

      const data = await response.json();
      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }, [router]);

  // Verifica se o usuário está ativo
  const checkActivity = useCallback(async () => {
    const now = Date.now();
    const inactiveTime = now - lastActivityRef.current;
    const MAX_INACTIVITY = 5 * 24 * 60 * 60 * 1000; // 5 dias

    if (inactiveTime > MAX_INACTIVITY) {
      clearInterval(refreshIntervalRef.current!);
      clearInterval(activityCheckRef.current!);

      // Chama API de logout para limpar cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      router.push('/login?reason=inactivity');
    }
  }, [router]);

  // Setup de polling e listeners
  useEffect(() => {
    // Eventos que indicam atividade do usuário
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Adiciona listeners de atividade
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Inicia polling de refresh token
    refreshIntervalRef.current = setInterval(() => {
      refreshToken();
    }, REFRESH_INTERVAL);

    // Inicia verificação de atividade
    activityCheckRef.current = setInterval(() => {
      checkActivity();
    }, CHECK_ACTIVITY_INTERVAL);

    // Faz refresh imediato ao montar
    //     refreshToken();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current);
      }
    };
  }, [refreshToken, checkActivity, updateActivity]);

  return {
    refreshToken,
    updateActivity,
  };
}
