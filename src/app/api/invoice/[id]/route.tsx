import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { InvoiceDocument } from './InvoiceDocument'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // Invoice ID, Invoice Number, Ref Number or Customer ID
  const { searchParams } = new URL(request.url)
  const isDownload = searchParams.get('download') === 'true'
  const customerIdParam = searchParams.get('customerId')

  let customer: any = null
  let invoice: any = null

  // 1. If explicit customerId is provided in query params, load that customer first
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
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 6
        }
      }
    })
  }

  // 2. Try finding invoice directly by ID or invoiceNumber
  if (!customer) {
    invoice = await prisma.invoice.findFirst({
      where: {
        OR: [
          { id },
          { invoiceNumber: id }
        ]
      },
      include: {
        customer: {
          include: {
            packagePlan: true,
            solarSystem: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 6
            }
          }
        }
      }
    })

    if (invoice?.customer) {
      customer = invoice.customer
    }
  }

  // 3. Try finding by Ledger Entry refNumber
  if (!customer) {
    const le = await prisma.ledgerEntry.findFirst({
      where: {
        OR: [
          { id },
          { refNumber: id },
          { invoiceId: id }
        ]
      },
      include: {
        customer: {
          include: {
            packagePlan: true,
            solarSystem: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 6
            }
          }
        }
      }
    })

    if (le?.customer) {
      customer = le.customer
      invoice = customer.invoices?.find((inv: any) => inv.id === le.invoiceId || inv.invoiceNumber === le.refNumber) || {
        id: le.id,
        invoiceNumber: le.refNumber || `INV-${customer.customerCode || '001'}`,
        customerId: customer.id,
        amount: Number(le.debit) || customer.packagePlan?.monthlyBasePrice || 1000,
        salesTax: customer.packagePlan?.salesTaxAmount || 0,
        totalAmount: Number(le.debit) || customer.packagePlan?.totalAmount || 1000,
        status: 'PAID',
        dueDate: le.createdAt || new Date(),
        billingPeriod: le.createdAt || new Date(),
        createdAt: le.createdAt || new Date(),
      }
    }
  }

  // 4. Check if id is directly a customerId, customerCode or crfNumber
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
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 6
        }
      }
    })
  }

  // If customer is found, prepare invoice object
  if (customer) {
    if (!invoice) {
      const matchInv = customer.invoices?.find((inv: any) => inv.id === id || inv.invoiceNumber === id)
      if (matchInv) {
        invoice = matchInv
      } else {
        const invNum = (id && (id.startsWith('LHR-') || id.startsWith('INV-'))) 
          ? id 
          : `INV-${customer.customerCode?.replace(/^[A-Za-z]+-/, '') || customer.id || '001'}`
        
        invoice = customer.invoices?.[0] || {
          id: 'inv-generated',
          invoiceNumber: invNum,
          customerId: customer.id,
          amount: customer.packagePlan?.monthlyBasePrice || 50000,
          salesTax: customer.packagePlan?.salesTaxAmount || 0,
          totalAmount: customer.packagePlan?.totalAmount || 50000,
          status: 'PAID',
          dueDate: new Date(),
          billingPeriod: new Date(),
          createdAt: new Date(),
        } as any
      }
    }
  }

  if (!customer) {
    return new NextResponse('Customer or Invoice not found', { status: 404 })
  }

  try {
    const logoPath = path.join(process.cwd(), 'public', 'invoice-logo.png')
    const solarBannerPath = path.join(process.cwd(), 'public', 'solar-house-banner.png')
    const paymentOptionsPath = path.join(process.cwd(), 'public', 'payment-options-block.png')
    const rightGraphicPath = path.join(process.cwd(), 'public', 'invoice-right-graphic.png')
    
    let logoSrc = ''
    let solarHouseBannerSrc = ''
    let paymentOptionsBlockSrc = ''
    let rightGraphicSrc = ''
    try {
      if (fs.existsSync(logoPath)) {
        logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
      }

      if (fs.existsSync(solarBannerPath)) {
        solarHouseBannerSrc = `data:image/png;base64,${fs.readFileSync(solarBannerPath).toString('base64')}`
      }
      if (fs.existsSync(paymentOptionsPath)) {
        paymentOptionsBlockSrc = `data:image/png;base64,${fs.readFileSync(paymentOptionsPath).toString('base64')}`
      }
      if (fs.existsSync(rightGraphicPath)) {
        rightGraphicSrc = `data:image/png;base64,${fs.readFileSync(rightGraphicPath).toString('base64')}`
      }
    } catch (e) {
      console.error('Failed to read image assets', e)
    }

    const stream = await renderToStream(
      <InvoiceDocument 
        customer={customer} 
        invoice={invoice} 
        logoSrc={logoSrc} 
        solarHouseBannerSrc={solarHouseBannerSrc}
        paymentOptionsBlockSrc={paymentOptionsBlockSrc}
        rightGraphicSrc={rightGraphicSrc} 
      />
    )
    
    // Convert Node stream to Web ReadableStream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      }
    })

    const filename = `Invoice-${invoice?.invoiceNumber || customer.customerCode || 'bill'}.pdf`
    const disposition = isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
      }
    })
  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return new NextResponse('Error generating PDF', { status: 500 })
  }
}

