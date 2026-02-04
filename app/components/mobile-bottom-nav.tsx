'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe, Sparkles, Target, Type, Menu } from 'lucide-react';
import { useSidebar } from './sidebar-layout';

const navItems = [
  { id: 'hubpage', label: 'HubPage', icon: Globe, path: '/hubpage' },
  { id: 'hubcampaign', label: 'Campaign', icon: Sparkles, path: '/hubcampaign' },
  { id: 'hubpixel', label: 'HubPixel', icon: Target, path: '/hubpixel' },
  { id: 'hubtitle', label: 'HubTitle', icon: Type, path: '/hubtitle' },
];

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { setMobileMenuOpen } = useSidebar();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {/* Botão Menu */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 px-2 py-1 text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] leading-none">Menu</span>
        </button>

        {/* Nav items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 transition-colors ${
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
