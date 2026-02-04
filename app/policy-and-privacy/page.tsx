'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function PolicyAndPrivacyPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src={resolvedTheme === 'dark' ? '/logo/logo-branca.png' : '/logo/logo-preta.png'}
              alt="Hubfi"
              width={80}
              height={22}
              priority
            />
          </button>
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            Voltar
          </button>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-card border border-border rounded-md p-6 md:p-10">
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground text-center mb-10">
            Política de Privacidade
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Informações Gerais</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                O aplicativo Hubfi tem como objetivo ajudar afiliados digitais a gerenciar campanhas, páginas e rastreamento de conversões com ferramentas de automação e inteligência artificial.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Coleta de Dados</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Coletamos informações diretamente fornecidas pelo usuário, como nome, telefone e email, com o intuito de melhorar nosso serviço, para ações de marketing e análise de dados. Não utilizamos cookies ou tecnologias similares para coletar dados.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Segurança</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Implementamos medidas de segurança robustas como criptografia para proteger os dados dos nossos usuários.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Direitos dos Usuários</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Usuários podem acessar, corrigir ou excluir seus dados pessoais através do ambiente de acesso restrito na área de configurações de perfil. Também é possível optar por não participar de determinadas formas de processamento de dados.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Retenção de Dados</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Os dados são mantidos enquanto a conta do usuário estiver ativa. Ao cancelar a conta, os dados são apagados automaticamente.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Alterações na Política</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Os usuários serão notificados via email sobre quaisquer alterações nesta política de privacidade.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Consentimento e Aceitação</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                O consentimento é obtido no momento da escolha do plano, com um link para esta página. O usuário deve marcar que leu a política antes de prosseguir. Para retirar o consentimento, o usuário pode cancelar e apagar sua conta nas configurações.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Requisitos Legais e Conformidade</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Nosso aplicativo está em conformidade com as principais leis de privacidade e proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Uso por Menores</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                O aplicativo Hubfi não é indicado para menores de idade.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground font-sans">
              Última atualização: 04 de fevereiro de 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
