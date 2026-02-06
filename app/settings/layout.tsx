'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ToastProvider, useSettingsToast } from './toast-context';
import { ToastContainer } from '@/components/ui/toast-container';

function SettingsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toasts, removeToast } = useSettingsToast();

  const navigationItems = [
    {
      section: 'CONTA',
      items: [
        { label: 'Meu perfil', path: '/settings/profile' },
      ],
    },
    {
      section: 'CONTAS GOOGLE',
      items: [
        { label: 'Meus Gmails, contas e ações', path: '/settings/accounts' },
        { label: 'Criar subconta para MCC', path: '/settings/create-subaccount' },
        { label: 'Criar ação de conversão (Pixel) Google Ads', path: '/settings/create-conversion' },
      ],
    },
  ];

  return (
    <>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-accent rouznded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-headline">Configurações</h1>
          </div>
        </div>

        {/* Layout com sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Sidebar de navegação */}
          <div className="w-full lg:w-80 flex-shrink-0 bg-card border border-border rounded-md p-4 md:h-[750px]">
            {navigationItems.map((section) => (
              <div key={section.section} className="mb-6">
                <h3 className="text-label text-primary font-medium mb-2">
                  {section.section}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`w-full text-left px-3 py-2 rounded-md text-body transition-colors ${
                        pathname === item.path
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 bg-card border border-border rounded-md p-6 h-[750px] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Toasts com posição fixa */}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
      />
    </>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <SettingsLayoutContent>{children}</SettingsLayoutContent>
    </ToastProvider>
  );
}
