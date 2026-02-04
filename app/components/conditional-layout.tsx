'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from "./sidebar-layout";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { UserProvider } from "../hooks/use-user";
import { AuthProvider } from "./auth-provider";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';
  const isPublicPage = pathname === '/home' || pathname === '/service-terms' || pathname === '/policy-and-privacy';
  const isPreviewPage = pathname.startsWith('/preview');

  if (isAuthPage || isPublicPage || isPreviewPage) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <MainContent>{children}</MainContent>
            <MobileBottomNav />
          </div>
        </SidebarProvider>
      </UserProvider>
    </AuthProvider>
  );
}