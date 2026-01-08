const { PrismaClient } = require('@prisma/client');

async function checkTemplates() {
  const prisma = new PrismaClient();
  
  try {
    const templates = await prisma.presellTemplate.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('Templates no banco:');
    templates.forEach(template => {
      console.log(`ID: ${template.id}, Nome: ${template.name}, Tipo: ${template.type}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();