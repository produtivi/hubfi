'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from "./sidebar-layout";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { UserProvider } from "../hooks/use-user";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isPreviewPage = pathname.startsWith('/preview');

  if (isLoginPage || isRegisterPage || isPreviewPage) {
    return <>{children}</>;
  }

  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}