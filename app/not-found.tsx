'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Home03 as Home, ArrowLeft } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  // Force remove sidebar layout
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <div className="fixed inset-0 z-9999 min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-accent rounded-full">
            <AlertCircle className="w-16 h-16 text-muted-foreground" />
          </div>
        </div>

        {/* 404 Number */}
        <h1 className="text-display font-bold text-foreground mb-4">404</h1>

        {/* Title */}
        <h2 className="text-headline text-foreground mb-4">
          Página não encontrada
        </h2>

        {/* Description */}
        <p className="text-body text-muted-foreground mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            color="secondary"
            iconLeading={ArrowLeft}
            onClick={() => router.back()}
          >
            Voltar
          </Button>

          <Button
            size="lg"
            color="primary"
            iconLeading={Home}
            onClick={() => router.push('/')}
          >
            Ir para Home
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-label text-muted-foreground mb-4">
            Precisa de ajuda? Aqui estão alguns links úteis:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/product-finder')}
              className="text-label text-primary hover:text-primary/80 transition-colors"
            >
              HubFinder
            </button>
            <button
              onClick={() => router.push('/hubtitle')}
              className="text-label text-primary hover:text-primary/80 transition-colors"
            >
              HubTitle
            </button>
            <button
              onClick={() => router.push('/page-builder')}
              className="text-label text-primary hover:text-primary/80 transition-colors"
            >
              HubPage
            </button>
            <button
              onClick={() => router.push('/ranking-hub')}
              className="text-label text-primary hover:text-primary/80 transition-colors"
            >
              HubRanking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
