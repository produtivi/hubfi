"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enquanto não montar, mostra logo preta por padrão
  if (!mounted) {
    return (
      <Image
        src="/logo/logo-preta.png"
        alt="Hubfi"
        width={120}
        height={32}
        priority
        unoptimized
      />
    );
  }

  // Depois de montar, mostra baseado no tema
  return (
    <Image
      src={resolvedTheme === "dark" ? "/logo/logo-branca.png" : "/logo/logo-preta.png"}
      alt="Hubfi"
      width={120}
      height={32}
      priority
      unoptimized
    />
  );
}
