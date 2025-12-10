'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from "./sidebar-layout";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}