import prisma from './src/lib/prisma';

async function main() {
  const customer = await prisma.customer.update({
    where: { customerCode: '3137' },
    data: { status: 'PENDING_INSTALLER_AUDIT' }
  });
  console.log('Customer 3137 status updated to PENDING_INSTALLER_AUDIT:', customer.status);
}

main()
  .catch(console.error)
  .finally(async () => {
    // Let pool drain or disconnect adapter if needed
    process.exit(0);
  });
