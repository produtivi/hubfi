'use client';

import { useSidebar } from './sidebar-layout';
import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isExpanded } = useSidebar();

  return (
    <main
      className={`flex-1 overflow-y-auto transition-all duration-300 pb-16 md:pb-0 ${
        isExpanded ? 'md:ml-64' : 'md:ml-20'
      }`}
    >
      {children}
    </main>
  );
}
