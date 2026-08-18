import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { ReceiptDocument } from './ReceiptDocument'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const isDownload = searchParams.get('download') === 'true'

  // 1. Try finding a ledger entry directly by ID or refNumber
  let ledgerEntry: any = await prisma.ledgerEntry.findFirst({
    where: {
      OR: [
        { id },
        { refNumber: id },
      ]
    },
    include: {
      customer: true
    }
  })

  let customer: any = ledgerEntry?.customer

  // 2. If not found, check if it's a customerId or customerCode
  if (!ledgerEntry) {
    customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id },
          { customerCode: id }
        ]
      },
      include: {
        ledgerEntries: {
          where: {
            credit: { gt: 0 }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (customer && customer.ledgerEntries?.length > 0) {
      ledgerEntry = customer.ledgerEntries[0]
    }
  }

  // 3. Fallback mock receipt if fresh/demo
  if (!customer) {
    customer = {
      customerCode: '9742',
      id: '9742',
      fullName: 'Muhammad Nouman Attique',
      contactNumber: '03314111483',
      cnic: '35201-5682141-6',
      address: '32-g Block Model Town Lahore, Karachi',
      accountExecutive: 'EnergyGurus Finance'
    }
  }

  const receiptData = ledgerEntry || {
    id: id || '303798',
    refNumber: id && id.startsWith('PRV-') ? id : `PRV-${id.replace(/^(INV|TX|REV)-/, '')}`,
    createdAt: new Date(),
    credit: 50000,
    amount: 50000,
    narration: 'Payment received against solar O&M subscription billing',
    paymentMethod: 'Online Bank Transfer / KuickPay'
  }

  // Load logo
  let logoSrc: string | undefined
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath)
    logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
  }

  try {
    const stream = await renderToStream(
      <ReceiptDocument 
        customer={customer} 
        receipt={receiptData} 
        logoSrc={logoSrc} 
      />
    )

    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    const fileName = `Receipt-Voucher-${receiptData.refNumber || 'Payment'}.pdf`
    headers.set('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`)

    return new NextResponse(stream as any, { headers })
  } catch (error: any) {
    console.error('Error generating Receipt Voucher PDF:', error)
    return NextResponse.json({ error: 'Failed to generate receipt voucher PDF' }, { status: 500 })
  }
}
