import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { GlobalPaymentDialog } from './GlobalPaymentDialog'
import { formatDate } from '@/lib/utils'

export default async function LedgerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true }
  })
  const userRole = dbUser?.role || 'SALES'

  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES'].includes(userRole)) {
    redirect('/dashboard/customers')
  }

  const [transactions, rawCustomers] = await Promise.all([
    prisma.transaction.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.findMany({
      select: { id: true, fullName: true, customerCode: true },
      orderBy: { fullName: 'asc' }
    })
  ])

  const customers = JSON.parse(JSON.stringify(rawCustomers))

  // Calculate totals
  const totalRevenue = transactions.reduce((sum, tx) => 
    tx.status === 'PAID' ? sum + Number(tx.amount) : sum, 0
  )
  const totalPending = transactions.reduce((sum, tx) => 
    tx.status === 'PENDING' ? sum + Number(tx.amount) : sum, 0
  )

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">Ledger & Invoices</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Global view of all transactions and O&M billing.</p>
        </div>
        <GlobalPaymentDialog customers={customers} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-ink)]">PKR {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-amber)]">PKR {totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent payments and pending invoices across all customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-[var(--color-slate-custom)]">
                    No transactions recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell className="font-medium">{tx.customer.fullName}</TableCell>
                    <TableCell>PKR {Number(tx.amount).toLocaleString()}</TableCell>
                    <TableCell>{tx.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          tx.status === 'PAID' 
                            ? 'bg-[#002868] text-white border-[#002868]'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/customers/${tx.customerId}`}>
                        <Button variant="ghost" size="sm">View Customer</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
