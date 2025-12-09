'use client';

import { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from './sidebar-layout';
import { Sidebar } from './sidebar';

interface WithSidebarProps {
  children: ReactNode;
}

function SidebarContent({ children }: WithSidebarProps) {
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main
        className={`${
          isExpanded ? 'ml-64' : 'ml-20'
        } transition-all duration-300 flex-1`}
      >
        {children}
      </main>
    </div>
  );
}

export function WithSidebar({ children }: WithSidebarProps) {
  return (
    <SidebarProvider>
      <SidebarContent>{children}</SidebarContent>
    </SidebarProvider>
  );
}
