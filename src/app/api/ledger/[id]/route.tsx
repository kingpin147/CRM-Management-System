import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { LedgerDocument } from './LedgerDocument'
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

  const targetId = customerIdParam || id

  // Fetch customer with all needed details and ledger entries
  let customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: targetId },
        { customerCode: targetId },
        { crfNumber: targetId }
      ]
    },
    include: {
      packagePlan: true,
      solarSystem: true,
      ledgerEntries: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  // If customer not found directly, try finding by ledgerEntry ID or refNumber
  if (!customer) {
    const entry = await prisma.ledgerEntry.findFirst({
      where: {
        OR: [
          { id: targetId },
          { refNumber: targetId }
        ]
      },
      include: {
        customer: {
          include: {
            packagePlan: true,
            solarSystem: true,
            ledgerEntries: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })
    if (entry?.customer) {
      customer = entry.customer
    }
  }

  if (!customer) {
    return NextResponse.json({ error: 'Customer or Ledger records not found' }, { status: 404 })
  }

  // Load logo as base64 data URI
  let logoSrc = ''
  try {
    const logoPath = path.join(process.cwd(), 'public', 'invoice-logo.png')
    const logoPathPdf = path.join(process.cwd(), 'public', 'LogoNew-pdf.png')
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
    } else if (fs.existsSync(logoPathPdf)) {
      const logoBuffer = fs.readFileSync(logoPathPdf)
      logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
    }
  } catch (e) {
    console.error('Failed to load logo:', e)
  }

  try {
    const pdfStream = await renderToStream(
      <LedgerDocument 
        customer={customer}
        ledgerEntries={customer.ledgerEntries || []}
        logoSrc={logoSrc}
      />
    )

    const customerDigits = customer.customerCode ? customer.customerCode.replace(/^[A-Za-z]+-/, '') : customer.id
    const filename = `Customer_Ledger_${customerDigits}.pdf`
    const dispositionType = isDownload ? 'attachment' : 'inline'

    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Failed to render Ledger PDF:', error)
    return NextResponse.json({ error: 'Failed to generate Ledger PDF statement' }, { status: 500 })
  }
}
