const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // Criar usuário de teste com senha criptografada
  const hashedPassword = await bcrypt.hash('123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@hubfi.com' },
    update: {
      password: hashedPassword // Atualizar senha se já existir
    },
    create: {
      email: 'admin@hubfi.com',
      name: 'Admin HubFi',
      password: hashedPassword
    }
  })

  console.log('Usuário criado:', { id: user.id, email: user.email, name: user.name })

  // Criar domínios
  const domains = [
    'lojaonlineproducts.site',
    'theofficialportal.store',
    'onlydiscount.site'
  ]

  const createdDomains = [];
  for (const domainName of domains) {
    const domain = await prisma.domain.upsert({
      where: { domainName },
      update: {},
      create: {
        domainName,
        isActive: true
      }
    })
    createdDomains.push(domain);
    console.log('Domínio criado:', domain)
  }

  // Criar templates EXATOS baseados no preview/[id]/page.tsx com HTML e CSS inline
  const originalTemplates = [
    {
      name: 'Cookies',
      type: 'Cookies', 
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 8px; max-width: 448px; width: 100%; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); cursor: pointer;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h3 style="font-size: 18px; font-weight: 600; color: #111827;">Cookie Settings</h3>
              <button style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 4px;">×</button>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.5;">We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking accept, you agree to this as described in our Cookie Policy.</p>
            <div style="display: flex; gap: 12px;">
              <button style="flex: 1; background-color: #000; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 500;">Yes, I accept</button>
              <button style="flex: 1; background-color: #e5e7eb; color: #111827; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 500;">No, I do not accept</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Maior de Idade',
      type: 'Maior de Idade',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 8px; max-width: 500px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
              <button style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 4px;">×</button>
            </div>
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 32px;">Você tem mais de 18 anos?</h2>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <button style="width: 120px; height: 80px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 24px;">✓</span>
                <span>Sim</span>
              </button>
              <button style="width: 120px; height: 80px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 24px;">✕</span>
                <span>Não</span>
              </button>
            </div>
            <div style="margin-top: 24px;">
              <button style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 14px; text-decoration: underline;">prefiro não informar</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Sexo',
      type: 'Sexo',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 8px; max-width: 500px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
              <button style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 4px;">×</button>
            </div>
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 32px;">Selecione o seu gênero</h2>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <button style="width: 150px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                <svg style="width: 32px; height: 32px; color: #4f46e5;" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2l4 -4l2 2l1 -1l3 -3v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7l3 3l1 1z"/></svg>
                <span>Masculino</span>
              </button>
              <button style="width: 150px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                <svg style="width: 32px; height: 32px; color: #ec4899;" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="4" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="12" cy="12" r="2"/></svg>
                <span>Feminino</span>
              </button>
            </div>
            <div style="margin-top: 24px;">
              <button style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 14px; text-decoration: underline;">prefiro não informar</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Idade Homem',
      type: 'Idade Homem',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 8px; max-width: 500px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
              <button style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 4px;">×</button>
            </div>
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 32px;">Selecione a sua faixa etária</h2>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <button style="width: 120px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 600;">18 - 29</span>
                <span style="font-size: 14px;">anos</span>
              </button>
              <button style="width: 120px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 600;">30 - 49</span>
                <span style="font-size: 14px;">anos</span>
              </button>
              <button style="width: 120px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 600;">50 - 69</span>
                <span style="font-size: 14px;">anos ou mais</span>
              </button>
            </div>
            <div style="margin-top: 24px;">
              <button style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 14px; text-decoration: underline;">prefiro não informar</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Idade Mulher',
      type: 'Idade Mulher',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 8px; max-width: 500px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
              <button style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 4px;">×</button>
            </div>
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 32px;">Selecione a sua faixa etária</h2>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <button style="width: 120px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 600;">18 - 29</span>
                <span style="font-size: 14px;">anos</span>
              </button>
              <button style="width: 120px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 600;">30 - 49</span>
                <span style="font-size: 14px;">anos</span>
              </button>
              <button style="width: 120px; height: 120px; background-color: #e5e7eb; color: #111827; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 600;">50 - 69</span>
                <span style="font-size: 14px;">anos ou mais</span>
              </button>
            </div>
            <div style="margin-top: 24px;">
              <button style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 14px; text-decoration: underline;">prefiro não informar</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Assinar newsletter',
      type: 'Assinar newsletter',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 8px; max-width: 450px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
              <button style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 4px;">×</button>
            </div>
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px;">Inscreva-se em nossa newsletter</h2>
            <p style="font-size: 16px; color: #6b7280; margin-bottom: 32px; line-height: 1.5;">Inscreva-se para receber semanalmente as últimas notícias, atualizações e ofertas incríveis diretamente na sua caixa de entrada.</p>
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
              <input type="email" placeholder="Email" style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; outline: none;" />
              <button style="background-color: #000; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px; font-weight: 600; white-space: nowrap;">Inscrever</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'País',
      type: 'País',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 12px; max-width: 600px; width: 100%; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer; position: relative;">
            <div style="position: absolute; top: 16px; right: 16px;">
              <button style="color: #000; background: none; border: none; cursor: pointer; padding: 8px; font-size: 24px; line-height: 1;">×</button>
            </div>
            <h2 style="font-size: 28px; font-weight: 700; color: #000; margin-bottom: 40px; margin-top: 0;">Selecione o seu país</h2>
            <div style="display: flex; gap: 24px; justify-content: center; margin-bottom: 32px;">
              <button style="width: 240px; height: 120px; background-color: #f5f5f5; color: #111827; border: 2px solid #000; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; position: relative;">
                <div style="width: 60px; height: 40px; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDQwIj4KICA8cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ0MCIgZmlsbD0iIzAwOTkzNyIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzIwLDEwMCA1NDAsMjIwIDMyMCwzNDAgMTAwLDIyMCIgZmlsbD0iI0ZFRDA0NyIvPgogIDxjaXJjbGUgY3g9IjMyMCIgY3k9IjIyMCIgcj0iNjAiIGZpbGw9IiMwMDIxNjgiLz4KPC9zdmc+) center/cover; border-radius: 4px;"></div>
                <span>Brasil</span>
              </button>
              <button style="width: 240px; height: 120px; background-color: #f5f5f5; color: #111827; border: 2px solid #000; border-radius: 16px; cursor: pointer; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center;">Outros países</button>
            </div>
            <div>
              <button style="background: none; border: none; color: #000; cursor: pointer; font-size: 16px; text-decoration: underline; font-weight: 400;">prefiro não informar</button>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Player de vídeo',
      type: 'Player de vídeo',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 12px; max-width: 600px; width: 100%; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); cursor: pointer; position: relative;">
            <div style="position: absolute; top: 16px; right: 16px; z-index: 10;">
              <button style="color: #000; background: none; border: none; cursor: pointer; padding: 8px; font-size: 24px; line-height: 1;">×</button>
            </div>
            <div style="width: 100%; height: 300px; background-color: #C8C0E8; border-radius: 8px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
              <div style="width: 80px; height: 80px; background-color: #DC2626; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); margin-bottom: 16px;">
                <div style="width: 0; height: 0; border-left: 24px solid white; border-top: 14px solid transparent; border-bottom: 14px solid transparent; margin-left: 4px;"></div>
              </div>
              <div style="color: #444; font-size: 20px; font-weight: 600;">Clique para assistir</div>
            </div>
          </div>
        </div>
      `
    },
    {
      name: 'Teste de captcha',
      type: 'Teste de captcha',
      templateHtml: `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="background-color: white; border-radius: 12px; max-width: 500px; width: 100%; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; cursor: pointer; position: relative;">
            <div style="position: absolute; top: 16px; right: 16px;">
              <button style="color: #000; background: none; border: none; cursor: pointer; padding: 8px; font-size: 24px; line-height: 1;">×</button>
            </div>
            <h2 style="font-size: 24px; font-weight: 600; color: #000; margin-bottom: 16px; margin-top: 0;">Robô ou humano?</h2>
            <p style="font-size: 16px; color: #666; margin-bottom: 32px; line-height: 1.5;">Clique no checkbox para garantirmos uma melhor experiência de navegação no nosso site.</p>
            <div style="cursor: pointer; display: flex; justify-content: center;">
              <img src="/captcha.png" alt="reCAPTCHA" style="width: 300px; height: auto; border-radius: 8px; display: block;" />
            </div>
          </div>
        </div>
      `
    },
  ];

  for (const template of originalTemplates) {
    const existing = await prisma.presellTemplate.findFirst({
      where: { name: template.name }
    })
    
    if (!existing) {
      const created = await prisma.presellTemplate.create({
        data: template
      })
      console.log('Template original criado:', created.name)
    } else {
      console.log('Template já existe:', existing.name)
    }
  }

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })