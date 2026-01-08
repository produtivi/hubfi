const { PrismaClient } = require('@prisma/client');

async function checkScreenshots() {
  const prisma = new PrismaClient();
  
  try {
    const presells = await prisma.presell.findMany({
      where: {
        OR: [
          { screenshotDesktop: { not: null } },
          { screenshotMobile: { not: null } }
        ]
      },
      select: {
        id: true,
        pageName: true,
        screenshotDesktop: true,
        screenshotMobile: true
      },
      orderBy: { id: 'desc' },
      take: 5
    });
    
    console.log('Últimas presells com screenshots:');
    presells.forEach(presell => {
      console.log(`\nID: ${presell.id} - ${presell.pageName}`);
      console.log(`Desktop: ${presell.screenshotDesktop}`);
      console.log(`Mobile: ${presell.screenshotMobile}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScreenshots();