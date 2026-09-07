import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.customer.findUnique({
    where: { customerCode: '3137' },
    include: {
      assignedInstaller: true,
      customerHistory: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  console.log(JSON.stringify(c, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
