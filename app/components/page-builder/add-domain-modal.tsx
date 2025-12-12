'use client';

import { useState } from 'react';
import { X, Check, Copy, ExternalLink } from 'lucide-react';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDomain: (domain: string, registrar: 'godaddy' | 'hostinger' | 'already-have') => void;
}

type Step = 'choose-registrar' | 'enter-domain' | 'configure-nameservers';

export function AddDomainModal({ isOpen, onClose, onAddDomain }: AddDomainModalProps) {
  const [step, setStep] = useState<Step>('choose-registrar');
  const [registrar, setRegistrar] = useState<'godaddy' | 'hostinger' | 'already-have' | null>(null);
  const [domain, setDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [isTransferringExisting, setIsTransferringExisting] = useState(false);

  const nameservers = ['brodie.ns.cloudflare.com', 'carioca.ns.cloudflare.com'];

  if (!isOpen) return null;

  const handleRegistrarChoice = (choice: 'godaddy' | 'hostinger' | 'already-have') => {
    setRegistrar(choice);
    setStep('enter-domain');
  };

  const validateDomain = (value: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!value) {
      setDomainError('');
      return false;
    }
    if (!domainRegex.test(value)) {
      setDomainError('Informe um domínio válido (nome do domínio + extensão - dominio.shop por exemplo)');
      return false;
    }
    setDomainError('');
    return true;
  };

  const handleDomainSubmit = () => {
    if (validateDomain(domain)) {
      setStep('configure-nameservers');
    }
  };

  const handleCopyNameserver = (ns: string) => {
    navigator.clipboard.writeText(ns);
  };

  const resetModalState = () => {
    setStep('choose-registrar');
    setRegistrar(null);
    setDomain('');
    setDomainError('');
    setIsTransferringExisting(false);
  };

  const handleFinish = () => {
    if (registrar) {
      onAddDomain(domain, registrar);
      onClose();
      resetModalState();
    }
  };

  const handleClose = () => {
    onClose();
    resetModalState();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            {step === 'configure-nameservers' && (
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <Check className="w-4 h-4 text-success-foreground" />
                  </div>
                  <span className="text-label text-success font-medium">Passo 1</span>
                </div>
                <span className="text-muted-foreground">...2</span>
              </div>
            )}
            <h2 className="text-title">
              {step === 'choose-registrar' && 'Adicionar domínio'}
              {step === 'enter-domain' && 'Adicionar domínio'}
              {step === 'configure-nameservers' && 'Informações sobre o domínio'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Choose Registrar */}
          {step === 'choose-registrar' && (
            <div className="space-y-4">
              <p className="text-body mb-6">Você já possui domínio registrado?</p>

              <button
                onClick={() => handleRegistrarChoice('already-have')}
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-label font-medium"
              >
                Sim, já possuo
              </button>

              <div className="space-y-3">
                <p className="text-label text-foreground font-medium">
                  Não, mas quero registrar na GoDaddy (recomendado)
                </p>

                <a
                  href="https://godaddy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 border border-border rounded-md hover:bg-accent transition-colors text-label text-primary"
                >
                  Não sabe registrar um domínio na GoDaddy? Clique aqui!
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleRegistrarChoice('godaddy')}
                    className="flex-1 px-6 py-4 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
                  >
                    <span className="font-bold text-lg">GoDaddy</span>
                  </button>
                  <button
                    onClick={() => handleRegistrarChoice('hostinger')}
                    className="flex-1 px-6 py-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-opacity"
                  >
                    <span className="font-bold text-lg">HOSTINGER</span>
                  </button>
                </div>
              </div>

              <p className="text-label text-foreground font-medium">
                Não, mas quero registrar na Hostinger
              </p>
            </div>
          )}

          {/* Step 2: Enter Domain */}
          {step === 'enter-domain' && (
            <div className="space-y-6">
              <div>
                <label className="block text-label text-foreground mb-2">
                  1. Insira a url do seu domínio *
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    validateDomain(e.target.value);
                  }}
                  placeholder="Nome do seu domínio"
                  className="w-full px-4 py-3 bg-card border border-border rounded-md text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {domainError && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-md">
                    <div className="flex items-start gap-2">
                      <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-label font-medium text-destructive">Domínio inválido</p>
                        <p className="text-label text-destructive mt-1">{domainError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="transferring"
                  checked={isTransferringExisting}
                  onChange={(e) => setIsTransferringExisting(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="transferring" className="text-body text-foreground">
                  Estou ciente que caso esteja transferindo um domínio existente,
                  as minhas páginas atuais (na godaddy por exemplo) irão parar de funcionar.
                </label>
              </div>

              <button
                onClick={handleDomainSubmit}
                disabled={!domain || !!domainError}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-label font-medium"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 3: Configure Nameservers */}
          {step === 'configure-nameservers' && (
            <div className="space-y-6">
              <div>
                <p className="text-label text-muted-foreground mb-2">1. Insira a url do seu domínio *</p>
                <p className="text-body text-foreground">{domain}</p>
              </div>

              <div>
                <p className="text-body mb-4">
                  2. Altere os nameservers (NS) do seu domínio no registrador (ex:godaddy) por esses abaixo
                </p>

                <div className="space-y-3">
                  {nameservers.map((ns, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ns}
                        readOnly
                        className="flex-1 px-4 py-3 bg-card border border-border rounded-md text-body text-foreground"
                      />
                      <button
                        onClick={() => handleCopyNameserver(ns)}
                        className="px-4 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                      >
                        Copiar
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-label text-muted-foreground mt-4">
                  Selecione o registrador abaixo para ver o passo-a-passo de
                  como alterar os servidores de nome do seu domínio
                </p>
              </div>

              <div>
                <p className="text-label text-foreground font-medium mb-3">Recomendado</p>
                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-4 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity">
                    <span className="font-bold text-lg">GoDaddy</span>
                  </button>
                  <button className="flex-1 px-6 py-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-opacity">
                    <span className="font-bold text-lg">HOSTINGER</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-label font-medium"
              >
                Pronto, já realizei a alteração dos namesservers
              </button>

              <div className="p-4 bg-success/10 border border-success rounded-md">
                <p className="text-label text-success">
                  Domínio adicionada com sucesso.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
