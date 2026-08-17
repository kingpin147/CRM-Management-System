import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Clock, ShieldCheck, DollarSign, Wrench } from 'lucide-react'

export default async function PendingSalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } }) : null
  const userRole = dbUser?.role || 'SALES'

  // Fetch all customer sales in pending pipeline stages
  const pendingCustomers = await prisma.customer.findMany({
    where: {
      status: {
        in: [
          'SIGNUP_GENERATED',
          'PENDING_PAYMENT_VERIFICATION',
          'PENDING_ACTIVATION',
        ]
      }
    },
    include: {
      packagePlan: true,
      solarSystem: true,
    },
    orderBy: { signupDate: 'desc' }
  })

  // Action for advancing workflow status
  async function advanceWorkflow(formData: FormData) {
    'use server'
    const customerId = formData.get('customerId') as string
    const currentStatus = formData.get('currentStatus') as string

    let nextStatus = currentStatus
    if (currentStatus === 'SIGNUP_GENERATED') {
      nextStatus = 'PENDING_PAYMENT_VERIFICATION' // Approved by Sales Manager -> Sent to Billing Manager
    } else if (currentStatus === 'PENDING_PAYMENT_VERIFICATION') {
      nextStatus = 'PENDING_ACTIVATION' // Payment verified by Billing Manager -> Sent to SD Manager
    } else if (currentStatus === 'PENDING_ACTIVATION') {
      nextStatus = 'CONNECTION_ACTIVE' // Approved by SD Manager -> Active Connection
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { 
        status: nextStatus as any,
        ...(nextStatus === 'CONNECTION_ACTIVE' ? { activationDate: new Date() } : {})
      }
    })

    revalidatePath('/dashboard/sales/pending')
    revalidatePath('/dashboard/customers')
  }

  const stage1Count = pendingCustomers.filter(c => c.status === 'SIGNUP_GENERATED').length
  const stage2Count = pendingCustomers.filter(c => c.status === 'PENDING_PAYMENT_VERIFICATION').length
  const stage3Count = pendingCustomers.filter(c => c.status === 'PENDING_ACTIVATION').length

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
          Pending Sales & Approval Pipeline
        </h1>
        <p className="text-[var(--color-slate-custom)] mt-1">
          Review, approve, and advance customer sales through Sales Manager, Billing Manager, and Service Delivery Manager checkpoints.
        </p>
      </div>

      {/* 3-Stage Pipeline Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Sales Manager Approval */}
        <Card className="border-line bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                Stage 1: Sales Manager Approval
              </div>
              <p className="text-xs text-amber-900/70">Created by Sales Person → Sent to Sales Manager</p>
              <p className="text-2xl font-bold text-amber-950 mt-1">{stage1Count} Pending</p>
            </div>
          </CardContent>
        </Card>

        {/* Stage 2: Billing Manager Payment Verification */}
        <Card className="border-line bg-blue-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Stage 2: Billing Manager Verification
              </div>
              <p className="text-xs text-blue-900/70">Approved by Sales Mgr → Pending Payment Verification</p>
              <p className="text-2xl font-bold text-blue-950 mt-1">{stage2Count} Pending</p>
            </div>
          </CardContent>
        </Card>

        {/* Stage 3: SD Manager Approval */}
        <Card className="border-line bg-emerald-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Wrench className="h-4 w-4 text-emerald-600" />
                Stage 3: SD Manager Approval
              </div>
              <p className="text-xs text-emerald-900/70">Payment Verified → Sent to SD Manager / Inventory</p>
              <p className="text-2xl font-bold text-emerald-950 mt-1">{stage3Count} Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Pipeline Jobs Table */}
      <Card className="shadow-sm border-line bg-white">
        <CardHeader className="py-4 border-b border-line">
          <CardTitle className="text-lg font-bold text-[var(--color-graphite)]">
            Active Sales Pipeline ({pendingCustomers.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Review customer sale details, package plans, and advance to next approval stage.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-xs">Customer Code / CRF</TableHead>
                <TableHead className="font-bold text-xs">Customer Name</TableHead>
                <TableHead className="font-bold text-xs">System / Package</TableHead>
                <TableHead className="font-bold text-xs">Contact & City</TableHead>
                <TableHead className="font-bold text-xs">Current Stage</TableHead>
                <TableHead className="font-bold text-xs">Next Responsible Dept</TableHead>
                <TableHead className="text-right font-bold text-xs">Workflow Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-[var(--color-slate-custom)]">
                    No sales currently pending in the approval pipeline.
                  </TableCell>
                </TableRow>
              ) : (
                pendingCustomers.map((c) => {
                  const isStage1 = c.status === 'SIGNUP_GENERATED'
                  const isStage2 = c.status === 'PENDING_PAYMENT_VERIFICATION'
                  const isStage3 = c.status === 'PENDING_ACTIVATION'

                  return (
                    <TableRow key={c.id} className="hover:bg-gray-50/80">
                      <TableCell className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                        {c.customerCode}
                        {c.crfNumber && <span className="block text-[11px] text-gray-400">CRF: {c.crfNumber}</span>}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-[var(--color-ink)]">
                        <Link href={`/dashboard/customers/${c.id}`} className="hover:underline text-[var(--color-graphite)] font-bold">
                          {c.fullName}
                        </Link>
                        <span className="block text-[11px] text-gray-400">{c.cnic}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-semibold text-gray-800">{c.packagePlan?.packageTier || 'Basic'}</span>
                        <span className="block text-[11px] text-gray-500">{c.packagePlan?.systemSizeKw || '1-10 kW'}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {c.contactNumber}
                        <span className="block text-[11px] text-gray-500">{c.city}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline"
                          className={
                            isStage1 ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' :
                            isStage2 ? 'bg-blue-100 text-blue-900 border-blue-300 font-semibold' :
                            'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                          }
                        >
                          {isStage1 ? 'Sales Manager Review' : isStage2 ? 'Payment Verification' : 'SD Manager Commissioning'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-gray-700">
                        {isStage1 ? 'Sales Manager' : isStage2 ? 'Billing Manager' : 'SD (Technical) Manager'}
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={advanceWorkflow} className="inline-block">
                          <input type="hidden" name="customerId" value={c.id} />
                          <input type="hidden" name="currentStatus" value={c.status} />
                          <Button 
                            type="submit" 
                            size="sm" 
                            className={
                              isStage1 ? 'bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1 shadow-xs' :
                              isStage2 ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 shadow-xs' :
                              'bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 shadow-xs'
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {isStage1 ? 'Approve Sale' : isStage2 ? 'Verify Payment' : 'Approve & Activate'}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
