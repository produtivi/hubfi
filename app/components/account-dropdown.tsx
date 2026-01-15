'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronUp, User, Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AccountDropdownProps {
  isExpanded: boolean;
}

export function AccountDropdown({ isExpanded }: AccountDropdownProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = {
    name: 'Caio Calderaro',
    email: 'caio@hubfi.com',
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Marcar como montado e detectar tema
  useEffect(() => {
    setMounted(true);
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };
    
    checkTheme();
    
    // Observer para mudanças no tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!isExpanded) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-3 hover:bg-accent rounded-md transition-colors outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border">
            <User className="w-5 h-5 text-foreground" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-4 py-3 border-b border-border bg-card">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>

            <div className="py-1 bg-card">
              <button
                onClick={() => {
                  router.push('/settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <span className="inline dark:hidden">
                  <Moon className="mr-2 h-4 w-4" />
                </span>
                <span className="hidden dark:inline">
                  <Sun className="mr-2 h-4 w-4" />
                </span>
                <span>Tema</span>
              </button>

              <div className="h-px bg-border opacity-50" />

              <button
                onClick={() => {
                  router.push('/login');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center  justify-between p-3 hover:bg-accent rounded-md transition-colors outline-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0 border border-border">
            <User className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex flex-col text-left min-w-0">
            <p className="text-sm font-medium text-foreground truncate w-full">{user.name}</p>
            <p className="text-xs text-muted-foreground  truncate w-full">{user.email}</p>
          </div>
        </div>
        <ChevronUp className={`w-6 h-6 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="py-1 bg-card">
            <button
              onClick={() => {
                router.push('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </button>

            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <span className="inline dark:hidden">
                <Moon className="mr-2 h-4 w-4" />
              </span>
              <span className="hidden dark:inline">
                <Sun className="mr-2 h-4 w-4" />
              </span>
              <span>Tema</span>
            </button>

            <div className="h-px bg-border" />

            <button
              onClick={() => {
                router.push('/login');
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
