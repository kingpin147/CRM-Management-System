import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const [totalCustomers, activeTickets, packages, transactions] = await Promise.all([
    prisma.customer.count(),
    prisma.ticket.count({ where: { status: 'PENDING' } }),
    prisma.packagePlan.count(),
    prisma.transaction.findMany({ select: { amount: true, status: true } })
  ])

  const totalRevenue = transactions.reduce((sum, tx) => 
    tx.status === 'PAID' ? sum + Number(tx.amount) : sum, 0
  )

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Overview</h1>
        <p className="text-[var(--color-slate-custom)] mt-1">Welcome back to the EnergyGurus command center.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-line hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-slate-custom)]">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-ink)]">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-line hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-slate-custom)]">Active Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-amber)]">{activeTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending resolution</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-line hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-slate-custom)]">Active O&M Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-ink)]">{packages}</div>
            <p className="text-xs text-muted-foreground mt-1">Maintenance contracts</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-line hover:shadow-md transition-shadow bg-gradient-to-br from-[var(--color-teal)]/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-ink)]">Revenue Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-ink)]">PKR {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-[var(--color-slate-custom)] mt-1">Total closed invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-line">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center border border-dashed border-line rounded-lg bg-[var(--color-paper)]">
              <span className="text-[var(--color-slate-custom)] font-mono text-sm">Chart visualization module goes here</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm border-line">
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="text-[var(--color-slate-custom)] text-sm italic">
                Navigate to Customers tab to view recent additions.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
