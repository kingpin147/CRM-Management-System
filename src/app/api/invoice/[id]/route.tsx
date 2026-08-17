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
  const { id } = await params // Invoice ID

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: { include: { packagePlan: true } } }
  })

  if (!invoice || !invoice.customer) {
    return new NextResponse('Invoice or Customer not found', { status: 404 })
  }
  
  const customer = invoice.customer

  try {
    const logoPath = path.join(process.cwd(), 'public', 'LogoNew-pdf.png')
    let logoSrc = ''
    try {
      const logoBuffer = fs.readFileSync(logoPath)
      logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
    } catch (e) {
      console.error('Failed to read logo', e)
    }

    const stream = await renderToStream(<InvoiceDocument customer={customer} invoice={invoice} logoSrc={logoSrc} />)
    
    // We need to convert the Node stream to a Web ReadableStream for Next.js Edge/Node response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      }
    })

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${customer.customerCode}.pdf"`
      }
    })
  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return new NextResponse('Error generating PDF', { status: 500 })
  }
}
