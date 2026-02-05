import Link from 'next/link';
import { Globe, Sparkles, Target, Type, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

const modules = [
  {
    icon: Globe,
    name: 'HubPage',
    description: 'Crie landing pages e presells otimizadas para conversão, com domínio próprio e editor visual intuitivo.',
  },
  {
    icon: Sparkles,
    name: 'HubCampaign',
    description: 'Automatize a criação de campanhas no Google Ads com inteligência artificial. Títulos, descrições e configurações prontos em segundos.',
  },
  {
    icon: Target,
    name: 'HubPixel',
    description: 'Gerencie pixels de rastreamento e ações de conversão para medir o desempenho real das suas campanhas.',
  },
  {
    icon: Type,
    name: 'HubTitle',
    description: 'Gere títulos e descrições persuasivos com IA para seus anúncios. Otimizados para Google Ads com limite de caracteres.',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Automação inteligente',
    description: 'Reduza horas de trabalho manual. Nossa plataforma automatiza desde a criação de campanhas até o rastreamento de conversões.',
  },
  {
    icon: BarChart3,
    title: 'Dados centralizados',
    description: 'Todas as suas métricas, campanhas e páginas em um só lugar. Tome decisões baseadas em dados reais.',
  },
  {
    icon: Sparkles,
    title: 'Inteligência artificial',
    description: 'Textos gerados por IA seguindo as melhores práticas de copywriting e otimizados para cada plataforma de anúncios.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo width={100} height={27} />
          <Link
            href="/login"
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-sans font-medium hover:opacity-80 transition-opacity"
          >
            Entrar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 text-center">
        <h1 className="font-serif text-4xl md:text-6xl font-medium text-foreground leading-tight mb-6">
          Tudo que um afiliado precisa,<br className="hidden md:block" /> em um só lugar
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-sans">
          Plataforma completa para afiliados digitais. Crie páginas, automatize campanhas, rastreie conversões e gere textos com inteligência artificial.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-sm font-sans font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            Comece agora
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border border-border text-foreground rounded-md text-sm font-sans font-medium hover:bg-accent transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Módulos */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4">
              Nossos módulos
            </h2>
            <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto">
              Ferramentas integradas para cada etapa do seu trabalho como afiliado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.name}
                  className="border border-border rounded-md p-6 md:p-8 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-accent rounded-md">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-medium text-foreground">{mod.name}</h3>
                  </div>
                  <p className="text-muted-foreground font-sans leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4">
            Por que escolher o Hubfi
          </h2>
          <p className="text-muted-foreground font-sans text-lg max-w-xl mx-auto">
            Construído por afiliados, para afiliados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className="inline-flex p-3 bg-accent rounded-md mb-5">
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground font-sans leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Uso de dados */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4">
              Transparência no uso de dados
            </h2>
            <p className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto">
              Entenda como e por que o Hubfi solicita acesso aos seus dados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="border border-border rounded-md p-6">
              <h3 className="font-serif text-lg font-medium text-foreground mb-3">
                Login com Google
              </h3>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                Solicitamos acesso ao seu email e nome para criar sua conta de forma rápida e segura, sem necessidade de senhas adicionais.
              </p>
            </div>
            <div className="border border-border rounded-md p-6">
              <h3 className="font-serif text-lg font-medium text-foreground mb-3">
                Integração com Google Ads
              </h3>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                Com sua autorização, acessamos sua conta Google Ads para criar campanhas, gerenciar anúncios e configurar ações de conversão automaticamente.
              </p>
            </div>
          </div>

          <p className="text-center text-muted-foreground font-sans text-sm mt-8 max-w-2xl mx-auto">
            Seus dados são utilizados exclusivamente para fornecer os serviços da plataforma. Não compartilhamos informações com terceiros. Para mais detalhes, consulte nossa{' '}
            <Link href="/policy-and-privacy" className="text-foreground underline hover:no-underline">
              Política de Privacidade
            </Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground font-sans text-lg mb-8 max-w-lg mx-auto">
            Crie sua conta gratuitamente e tenha acesso a todas as ferramentas da plataforma.
          </p>
          <Link
            href="/register"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-sm font-sans font-medium hover:opacity-80 transition-opacity"
          >
            Criar conta gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo width={80} height={22} />
          <div className="flex items-center gap-6">
            <Link
              href="/service-terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              Termos de Serviço
            </Link>
            <Link
              href="/policy-and-privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
