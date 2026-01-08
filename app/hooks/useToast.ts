'use client';

import { useState } from 'react';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({
      type,
      message,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast('success', message),
    showError: (message: string) => showToast('error', message),
    showInfo: (message: string) => showToast('info', message)
  };
}