import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE pixels
    SET presell_url = 'https://placeholder.com'
    WHERE presell_url IS NULL
  `

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
