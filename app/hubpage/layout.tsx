'use client';

import { ToastProvider, useHubPageToast } from './toast-context';
import { ToastContainer } from '@/components/ui/toast-container';

function HubPageLayoutContent({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useHubPageToast();

  return (
    <>
      {children}

      {/* Toasts com posição fixa */}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
      />
    </>
  );
}

export default function HubPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <HubPageLayoutContent>{children}</HubPageLayoutContent>
    </ToastProvider>
  );
}
