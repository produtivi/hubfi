'use client';

import { useState } from 'react';
import { XClose, Copy01, AlertCircle, CheckCircle } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDomain: (domain: string, registrar: 'godaddy' | 'hostinger' | 'already-have') => void;
}

type Step = 'enter-domain' | 'configure-dns';

export function AddDomainModal({ isOpen, onClose, onAddDomain }: AddDomainModalProps) {
  const [step, setStep] = useState<Step>('enter-domain');
  const [registrar, setRegistrar] = useState<'godaddy' | 'hostinger' | 'already-have'>('already-have');
  const [domain, setDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [copied, setCopied] = useState(false);

  const cnameTarget = 'customers.eduardoborges.dev.br';

  const validateDomain = (value: string) => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!value) {
      setDomainError('');
      return false;
    }
    if (!domainRegex.test(value)) {
      setDomainError('Informe um domínio válido (ex: dominio.com)');
      return false;
    }
    setDomainError('');
    return true;
  };

  const handleDomainSubmit = () => {
    if (validateDomain(domain)) {
      setStep('configure-dns');
    }
  };

  const handleCopyCNAME = () => {
    navigator.clipboard.writeText(cnameTarget);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModalState = () => {
    setStep('enter-domain');
    setDomain('');
    setDomainError('');
    setCopied(false);
  };

  const handleFinish = () => {
    if (registrar) {
      onAddDomain(domain, registrar);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    resetModalState();
  };

  const getHostname = () => {
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    return '@';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-title font-semibold">
              {step === 'enter-domain' && 'Adicionar Domínio'}
              {step === 'configure-dns' && 'Configurar DNS'}
            </h2>
            <p className="text-label text-muted-foreground mt-1">
              {step === 'enter-domain' && 'Digite o domínio ou subdomínio que deseja usar'}
              {step === 'configure-dns' && 'Configure o CNAME no painel DNS do seu domínio'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-md transition-colors -mt-1 -mr-1"
            aria-label="Fechar"
          >
            <XClose className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Enter Domain */}
          {step === 'enter-domain' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-label text-muted-foreground">
                  Domínio ou subdomínio
                </label>
                <Input
                  value={domain}
                  onChange={(value) => {
                    setDomain(value);
                    validateDomain(value);
                  }}
                  placeholder="exemplo.com ou app.exemplo.com"
                  isInvalid={!!domainError}
                />
                {domainError && (
                  <p className="text-label text-destructive mt-1">{domainError}</p>
                )}
              </div>

              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-label font-medium text-foreground mb-2">Exemplos válidos:</p>
                <ul className="text-label text-muted-foreground space-y-1">
                  <li>• minhaloja.com</li>
                  <li>• app.minhaempresa.com.br</li>
                  <li>• loja.exemplo.shop</li>
                </ul>
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full"
                onClick={handleDomainSubmit}
                isDisabled={!domain || !!domainError}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Configure DNS */}
          {step === 'configure-dns' && (
            <div className="space-y-5">
              {/* Domínio selecionado */}
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-label text-muted-foreground">Domínio:</p>
                <p className="text-body font-medium text-foreground">{domain}</p>
              </div>

              {/* Instruções CNAME */}
              <div>
                <p className="text-body font-medium text-foreground mb-3">
                  Configure um registro CNAME:
                </p>

                <div className="border border-border rounded-lg divide-y divide-border">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-label text-muted-foreground">Tipo</p>
                      <p className="text-body font-medium text-foreground">CNAME</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-label text-muted-foreground">Host / Nome</p>
                    <p className="text-body font-medium text-foreground">{getHostname()}</p>
                  </div>

                  <div className="p-4">
                    <p className="text-label text-muted-foreground mb-2">Aponta para</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-body text-foreground font-mono text-sm">
                        {cnameTarget}
                      </code>
                      <Button
                        color={copied ? 'secondary' : 'primary'}
                        size="sm"
                        iconLeading={copied ? CheckCircle : Copy01}
                        onClick={handleCopyCNAME}
                      >
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-label text-muted-foreground">TTL</p>
                    <p className="text-body font-medium text-foreground">Auto ou 3600</p>
                  </div>
                </div>
              </div>

              {/* Info boxes */}
              <div className="space-y-3">
                <div className="flex gap-3 p-4 bg-accent/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-foreground mb-1">Onde configurar?</p>
                    <p className="text-label text-muted-foreground">
                      Acesse o painel do seu provedor (GoDaddy, Hostinger, Registro.br, etc.) e procure por "DNS" ou "Gerenciar DNS".
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-accent/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-label font-medium text-foreground mb-1">Tempo de propagação</p>
                    <p className="text-label text-muted-foreground">
                      Pode levar de <strong className="text-foreground">5 minutos até 24 horas</strong> para funcionar.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full"
                onClick={handleFinish}
              >
                Adicionar Domínio
              </Button>

              <p className="text-label text-muted-foreground text-center">
                Você poderá verificar o status na lista após adicionar.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
