'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function ServiceTermsPage() {
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
            Termos de Serviço
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Aceitação dos Termos</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Ao acessar e usar o aplicativo Hubfi, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso, que, juntamente com nossa Política de Privacidade, regem a relação do Hubfi com você em relação a este aplicativo. Se você não concordar com algum desses termos, por favor, não use nosso aplicativo.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Uso do Serviço</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                O aplicativo Hubfi fornece ferramentas de gestão e automação para afiliados digitais, e você concorda em não utilizar tais ferramentas para qualquer fim que seja ilegal ou proibido por estes termos.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Modificações do Serviço e Preços</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Reservamo-nos o direito de modificar ou descontinuar o serviço (ou qualquer parte ou conteúdo dele) sem aviso prévio a qualquer momento. Também não seremos responsáveis por você ou qualquer terceiro por qualquer modificação, mudança de preço, suspensão ou descontinuação do serviço.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Contas e Segurança</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Você é responsável por manter a segurança da sua conta e senha. O Hubfi não pode e não será responsável por qualquer perda ou dano resultante de seu descumprimento desta segurança.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Propriedade Intelectual</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Todo o conteúdo incluído ou disponibilizado através do aplicativo Hubfi, como textos, gráficos, logos e ícones, é propriedade do Hubfi ou de seus fornecedores de conteúdo e é protegido pelas leis de direitos autorais e de marcas comerciais brasileiras e internacionais.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Limitação de Responsabilidade</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Em nenhum caso o Hubfi será responsável por quaisquer danos indiretos, incidentais, especiais ou consequências decorrentes do uso ou incapacidade de usar o serviço.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Legislação Aplicável</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Estes termos de serviço serão regidos e interpretados de acordo com as leis do Brasil, sem consideração a qualquer conflito de princípios legais.
              </p>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-foreground mb-2">Mudanças nos Termos de Serviço</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                Reservamo-nos o direito, a nosso exclusivo critério, de atualizar, alterar ou substituir qualquer parte destes Termos de Serviço, publicando atualizações e mudanças no nosso aplicativo. É sua responsabilidade verificar nosso aplicativo periodicamente para mudanças.
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
