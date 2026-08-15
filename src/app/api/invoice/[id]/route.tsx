import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToStream } from '@react-pdf/renderer'
import { InvoiceDocument } from './InvoiceDocument'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params // Customer ID

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { packagePlan: true }
  })

  if (!customer || !customer.packagePlan) {
    return new NextResponse('Customer or Package not found', { status: 404 })
  }

  try {
    const stream = await renderToStream(<InvoiceDocument customer={customer} />)
    
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
