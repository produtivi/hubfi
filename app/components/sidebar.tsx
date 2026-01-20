'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Zap, BarChart3, TrendingUp, Globe, Sparkles, Target, Menu, Type } from 'lucide-react';
import Image from 'next/image';
import { AccountDropdown } from './account-dropdown';
import { useSidebar } from './sidebar-layout';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebar();
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

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/' },
    { id: 'product-finder', label: 'HubFinder', icon: Zap, path: '/product-finder' },
    { id: 'ads-analytics', label: 'HubAds', icon: BarChart3, path: '/ads-analytics' },
    { id: 'ranking-hub', label: 'HubRanking', icon: TrendingUp, path: '/ranking-hub' },
    { id: 'page-builder', label: 'HubPage', icon: Globe, path: '/page-builder' },
    { id: 'campaign-wizard', label: 'HubCampaign', icon: Sparkles, path: '/campaign-wizard/campaigns' },
    { id: 'pixel-tracker', label: 'HubPixel', icon: Target, path: '/pixel-tracker' },
    { id: 'title-generator', label: 'HubTitle', icon: Type, path: '/hubtitle' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`${isExpanded ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-50`}
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
              className=""
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
  );
}
