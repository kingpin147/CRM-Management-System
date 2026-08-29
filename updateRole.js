const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'ipnoc@energygurus.online' },
      data: { role: 'IP_NOC_EXECUTIVE' },
    });
    console.log('Updated user:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
