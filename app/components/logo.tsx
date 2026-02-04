"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 120, height = 32 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const src = mounted && resolvedTheme === "dark"
    ? "/logo/logo-branca.png"
    : "/logo/logo-preta.png";

  return (
    <Image
      src={src}
      alt="Hubfi"
      width={width}
      height={height}
      priority
      unoptimized
    />
  );
}
