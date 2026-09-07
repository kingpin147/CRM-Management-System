import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.update({
    where: { customerCode: '3137' },
    data: { status: 'PENDING_INSTALLER_AUDIT' }
  });
  console.log('Customer 3137 status updated to PENDING_INSTALLER_AUDIT');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
