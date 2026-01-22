'use client';

import { useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, isVisible, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-success" />;
      case 'error':
        return <X className="w-5 h-5 text-destructive" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-md shadow-lg min-w-[300px]">
        {getIcon()}
        <span className="text-body text-foreground flex-1">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}