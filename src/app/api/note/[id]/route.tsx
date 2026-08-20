import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { NoteDocument } from './NoteDocument'
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

  // 1. If explicit customerId provided, load customer & ledger entry
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
        packagePlan: true,
        solarSystem: true,
        ledgerEntries: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (customer && customer.ledgerEntries?.length > 0) {
      ledgerEntry = customer.ledgerEntries.find((le: any) => le.id === id || le.refNumber === id) || customer.ledgerEntries[0]
    }
  }

  // 2. Try finding ledger entry directly by ID or refNumber
  if (!ledgerEntry) {
    ledgerEntry = await prisma.ledgerEntry.findFirst({
      where: {
        OR: [
          { id },
          { refNumber: id },
        ]
      },
      include: {
        customer: {
          include: {
            packagePlan: true,
            solarSystem: true,
          }
        }
      }
    })

    if (ledgerEntry?.customer) {
      customer = ledgerEntry.customer
    }
  }

  // 3. Fallback: search customer directly
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
        packagePlan: true,
        solarSystem: true,
        ledgerEntries: {
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
    return new NextResponse('Customer or Voucher Note not found', { status: 404 })
  }

  // Logo asset resolution
  let logoSrc: string | undefined = undefined
  try {
    const publicLogoPath = path.join(process.cwd(), 'public', 'invoice-logo.png')
    if (fs.existsSync(publicLogoPath)) {
      const imageBuffer = fs.readFileSync(publicLogoPath)
      logoSrc = `data:image/png;base64,${imageBuffer.toString('base64')}`
    }
  } catch (err) {
    console.error('Failed to load invoice logo for note document:', err)
  }

  const cleanCode = id.replace(/^(TX|DB-ADJ|CR-ADJ|Debit Note|Credit Note)-+/gi, '') || '62DC6B1B'
  const isDebit = ledgerEntry ? Number(ledgerEntry.debit) > 0 : true

  const noteData = ledgerEntry || {
    id: id || '62DC6B1B',
    refNumber: isDebit ? `Debit Note-${cleanCode}` : `Credit Note-${cleanCode}`,
    createdAt: new Date(),
    debit: isDebit ? 3000 : 0,
    credit: !isDebit ? 3000 : 0,
    narration: isDebit 
      ? 'Debit Note charged against Solar System Audit Charges / Package Adjustment' 
      : 'Credit Note Adjustment against Package Downgrade',
  }

  const stream = await renderToStream(
    <NoteDocument 
      customer={customer} 
      note={noteData} 
      logoSrc={logoSrc} 
    />
  )

  const isDebitVoucher = Number(noteData.debit) > 0 || noteData.narration?.toLowerCase().includes('debit note') || noteData.refNumber?.includes('Debit Note')
  const filename = `${isDebitVoucher ? 'Debit_Note' : 'Credit_Note'}_${cleanCode}.pdf`
  const dispositionType = isDownload ? 'attachment' : 'inline'

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${dispositionType}; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
