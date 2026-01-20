import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

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

  for (const domainName of domains) {
    const domain = await prisma.domain.upsert({
      where: { domainName },
      update: {},
      create: {
        domainName,
        isActive: true
      }
    })
    console.log('Domínio criado:', domain)
  }

  // Criar tipos de presell
  const presellTypes = [
    { name: 'Cookies', type: 'modal' },
    { name: 'Maior de Idade', type: 'modal' },
    { name: 'Sexo', type: 'modal' },
    { name: 'Idade Homem', type: 'modal' },
    { name: 'Idade Mulher', type: 'modal' },
    { name: 'Assinar newsletter', type: 'modal' },
    { name: 'País', type: 'modal' },
    { name: 'Player de vídeo', type: 'modal' },
    { name: 'Teste de captcha', type: 'modal' },
    { name: 'VSL', type: 'page' },
    { name: 'Carta de Vendas', type: 'page' },
    { name: 'Landing Page', type: 'page' },
    { name: 'Página de Captura', type: 'page' }
  ]

  for (const presellType of presellTypes) {
    const template = await prisma.presellTemplate.upsert({
      where: { id: presellTypes.indexOf(presellType) + 1 },
      update: {},
      create: {
        name: presellType.name,
        type: presellType.type,
        templateHtml: '',
        isActive: true
      }
    })
    console.log('Tipo de presell criado:', template.name)
  }

  console.log('Banco de dados configurado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })