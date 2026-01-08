"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-border bg-transparent hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5">
        <Sun className="absolute inset-0 h-5 w-5 opacity-0 dark:opacity-100" />
        <Moon className="absolute inset-0 h-5 w-5 opacity-100 dark:opacity-0" />
      </div>
    </button>
  );
}
