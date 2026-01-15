'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }: DialogContentProps) => {
  return (
    <div className={`bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md ${className}`}>
      {children}
    </div>
  );
};

const DialogHeader = ({ children, className = '' }: DialogHeaderProps) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className = '' }: DialogTitleProps) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle };