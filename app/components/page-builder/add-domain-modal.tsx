'use client';

import { useState } from 'react';
import { X, Check, Copy, ExternalLink } from 'lucide-react';

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

  const cnameTarget = 'customers.eduardoborges.dev.br';

  if (!isOpen) return null;

  const validateDomain = (value: string) => {
    // Aceita domínios e subdomínios: exemplo.com, app.exemplo.com, api.app.exemplo.com
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
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
      setStep('configure-dns');
    }
  };

  const handleCopyCNAME = () => {
    navigator.clipboard.writeText(cnameTarget);
  };

  const resetModalState = () => {
    setStep('enter-domain');
    setDomain('');
    setDomainError('');
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
            <h2 className="text-title">
              {step === 'enter-domain' && 'Adicionar Domínio Customizado'}
              {step === 'configure-dns' && 'Configurar DNS'}
            </h2>
            <p className="text-label text-muted-foreground mt-1">
              {step === 'enter-domain' && 'Digite o domínio ou subdomínio que deseja usar'}
              {step === 'configure-dns' && 'Configure o CNAME no painel DNS do seu domínio'}
            </p>
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
          {/* Step 1: Enter Domain */}
          {step === 'enter-domain' && (
            <div className="space-y-6">
              <div>
                <label className="block text-label text-foreground mb-2">
                  Digite seu domínio ou subdomínio
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    validateDomain(e.target.value);
                  }}
                  placeholder="exemplo: minhaloja.com ou app.minhaloja.com"
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

              <div className="p-4 bg-accent rounded-md">
                <p className="text-label font-medium mb-2">Exemplos válidos:</p>
                <ul className="text-label text-muted-foreground space-y-1">
                  <li>• minhaloja.com (domínio raiz)</li>
                  <li>• app.minhaempresa.com.br (subdomínio)</li>
                  <li>• loja.exemplo.shop (subdomínio)</li>
                </ul>
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

          {/* Step 2: Configure DNS */}
          {step === 'configure-dns' && (
            <div className="space-y-6">
              <div className="p-4 bg-accent rounded-md">
                <p className="text-label font-medium mb-1">Domínio:</p>
                <p className="text-body text-foreground">{domain}</p>
              </div>

              <div>
                <p className="text-body font-medium mb-4">
                  Configure um registro CNAME no painel DNS do seu domínio:
                </p>

                <div className="space-y-3 p-4 bg-card border border-border rounded-md">
                  <div>
                    <p className="text-label text-muted-foreground">Type:</p>
                    <p className="text-body font-medium">CNAME</p>
                  </div>
                  <div>
                    <p className="text-label text-muted-foreground">Name / Host:</p>
                    <p className="text-body font-medium">
                      {domain.split('.')[0]} {domain.split('.').length > 2 && '(ou @ se for domínio raiz)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-label text-muted-foreground">Target / Points to:</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-body">
                        {cnameTarget}
                      </code>
                      <button
                        onClick={handleCopyCNAME}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-label text-muted-foreground">TTL:</p>
                    <p className="text-body font-medium">Auto ou 3600</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
                <p className="text-label font-medium text-blue-600 dark:text-blue-400 mb-2">
                  Onde configurar o DNS?
                </p>
                <p className="text-label text-muted-foreground">
                  Acesse o painel do seu provedor de domínio (GoDaddy, Hostinger, Registro.br, DigitalOcean, etc.)
                  e procure por "DNS", "DNS Management" ou "Gerenciar DNS".
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <p className="text-label font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                  Tempo de propagação
                </p>
                <p className="text-label text-muted-foreground">
                  Após configurar o DNS, pode levar <strong className="text-foreground">de 5 minutos até 24 horas</strong> para
                  o domínio começar a funcionar. A propagação DNS depende do seu provedor e pode variar.
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-label font-medium"
              >
                Adicionar Domínio
              </button>

              <p className="text-label text-muted-foreground text-center">
                Você poderá verificar o status do domínio na lista após adicioná-lo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
