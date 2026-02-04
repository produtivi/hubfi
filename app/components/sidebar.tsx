'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Zap, BarChart3, TrendingUp, Globe, Sparkles, Target, Menu, Type, X } from 'lucide-react';
import Image from 'next/image';
import { AccountDropdown } from './account-dropdown';
import { useSidebar } from './sidebar-layout';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isExpanded, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useSidebar();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const htmlDark = document.documentElement.classList.contains('dark');
      setIsDark(htmlDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Fechar menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'hubfinder', label: 'HubFinder', icon: Zap, path: '/hubfinder' },
    { id: 'hubads', label: 'HubAds', icon: BarChart3, path: '/hubads' },
    { id: 'hubranking', label: 'HubRanking', icon: TrendingUp, path: '/hubranking' },
    { id: 'hubpage', label: 'HubPage', icon: Globe, path: '/hubpage' },
    { id: 'hubcampaign', label: 'HubCampaign', icon: Sparkles, path: '/hubcampaign' },
    { id: 'hubpixel', label: 'HubPixel', icon: Target, path: '/hubpixel' },
    { id: 'title-generator', label: 'HubTitle', icon: Type, path: '/hubtitle' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Backdrop mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <aside
        className={`${isExpanded ? 'w-64' : 'w-20'
          } bg-card border-r border-border transition-all duration-300 flex-col h-screen fixed left-0 top-0 z-50 hidden md:flex`}
      >
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          {isExpanded ? (
            <>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={isDark ? "/logo/logo-branca.png" : "/logo/logo-preta.png"}
                  alt="Hubfi"
                  width={100}
                  height={27}
                  priority
                />
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Fechar sidebar"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center hover:opacity-80 transition-opacity w-full"
              aria-label="Expandir sidebar"
            >
              <Image
                src={isDark ? "/logo/logotipo-branco.png" : "/logo/logotipo-preto.png"}
                alt="Hubfi"
                width={24}
                height={24}
                priority
              />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-sans transition-colors ${active
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      } ${!isExpanded ? 'justify-center' : ''}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {isExpanded && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Account Dropdown */}
        <div className="border-t border-border p-3">
          <AccountDropdown isExpanded={isExpanded} />
        </div>
      </aside>

      {/* Sidebar mobile (overlay) */}
      <aside
        className={`fixed left-0 top-0 z-50 w-64 bg-card border-r border-border flex flex-col h-screen transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header mobile */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src={isDark ? "/logo/logo-branca.png" : "/logo/logo-preta.png"}
              alt="Hubfi"
              width={100}
              height={27}
              priority
            />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation Items mobile */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-sans transition-colors ${active
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer mobile */}
        <div className="border-t border-border p-3">
          <AccountDropdown isExpanded={true} />
        </div>
      </aside>
    </>
  );
}
