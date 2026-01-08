import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { email: 'admin@hubfi.com' },
    update: {},
    create: {
      email: 'admin@hubfi.com',
      name: 'Admin HubFi'
    }
  })

  console.log('Usuário criado:', user)

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

  // Criar templates
  const templates = [
    {
      name: 'VSL Padrão',
      type: 'VSL',
      templateHtml: '<div>Template VSL</div>'
    },
    {
      name: 'Carta de Vendas Clássica',
      type: 'Carta de Vendas',
      templateHtml: '<div>Template Carta</div>'
    },
    {
      name: 'Landing Page Moderna',
      type: 'Landing Page',
      templateHtml: '<div>Template Landing</div>'
    },
    {
      name: 'Captura com Isca Digital',
      type: 'Página de Captura',
      templateHtml: '<div>Template Captura</div>'
    }
  ]

  for (const template of templates) {
    // Verificar se já existe
    const existing = await prisma.presellTemplate.findFirst({
      where: { name: template.name }
    })
    
    if (!existing) {
      const created = await prisma.presellTemplate.create({
        data: template
      })
      console.log('Template criado:', created)
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