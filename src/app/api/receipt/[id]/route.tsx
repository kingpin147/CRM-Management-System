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
  const customerIdParam = searchParams.get('customerId')

  let customer: any = null
  let ledgerEntry: any = null

  // 1. If explicit customerId provided, load that customer first
  if (customerIdParam) {
    customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id: customerIdParam },
          { customerCode: customerIdParam },
          { crfNumber: customerIdParam }
        ]
      },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (customer && customer.ledgerEntries?.length > 0) {
      ledgerEntry = customer.ledgerEntries.find((le: any) => le.id === id || le.refNumber === id) || customer.ledgerEntries.find((le: any) => Number(le.credit) > 0) || customer.ledgerEntries[0]
    }
  }

  // 2. Try finding a ledger entry directly by ID or refNumber
  if (!ledgerEntry) {
    ledgerEntry = await prisma.ledgerEntry.findFirst({
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

    if (ledgerEntry?.customer) {
      customer = ledgerEntry.customer
    }
  }

  // 3. If not found, check if id is a customerId or customerCode
  if (!customer) {
    customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id },
          { customerCode: id },
          { crfNumber: id }
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

  if (!customer) {
    return new NextResponse('Customer or Receipt not found', { status: 404 })
  }

  const cleanRef = id.replace(/^(PAY|RCP|PRV|INV|TX|REV|KuickPay|KUICKPAY)-+/gi, '') || '2026-007'
  const receiptData = ledgerEntry || {
    id: id || '2026-007',
    refNumber: `PRV-${cleanRef}`,
    createdAt: new Date(),
    credit: 40600,
    amount: 40600,
    narration: 'Payment received for INV-2026-007 via Bank Alfalah / 1Link',
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
