import prisma from './src/lib/prisma';

async function main() {
  try {
    const raw = await prisma.customer.findMany({
      where: {
        status: {
          in: ['SIGNUP_GENERATED', 'PENDING_PAYMENT_VERIFICATION', 'PENDING_ACTIVATION']
        }
      },
      include: {
        packagePlan: true,
        solarSystem: true,
        accountExecutive: true,
        assignedInstaller: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { signupDate: 'desc' }
    });
    
    // Simulate what happens in page.tsx
    const pendingCustomers = JSON.parse(JSON.stringify(raw));
    console.log('Successfully serialized, length:', pendingCustomers.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
