import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeConstraints() {
  try {
    // Remover constraints que estão causando problemas
    await prisma.$executeRaw`ALTER TABLE presells DROP CONSTRAINT IF EXISTS presells_presell_type_check;`
    await prisma.$executeRaw`ALTER TABLE presells DROP CONSTRAINT IF EXISTS presells_language_check;`
    await prisma.$executeRaw`ALTER TABLE presells DROP CONSTRAINT IF EXISTS presells_status_check;`
    await prisma.$executeRaw`ALTER TABLE presell_templates DROP CONSTRAINT IF EXISTS presell_templates_type_check;`
    await prisma.$executeRaw`ALTER TABLE presell_analytics DROP CONSTRAINT IF EXISTS presell_analytics_event_type_check;`
    
    console.log('Constraints removidos com sucesso!')
    
  } catch (error) {
    console.error('Erro ao remover constraints:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeConstraints()