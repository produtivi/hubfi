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