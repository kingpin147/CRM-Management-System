import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { SignupDocument } from './SignupDocument'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const isDownload = searchParams.get('download') === 'true'

  // Query Customer including solarSystem and packagePlan
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id },
        { customerCode: id },
        { crfNumber: id }
      ]
    },
    include: {
      solarSystem: true,
      packagePlan: true,
      accountExecutive: true,
    }
  })

  if (!customer) {
    return new NextResponse('Customer record not found for Signup PDF', { status: 404 })
  }

  // Load logo
  let logoSrc: string | undefined
  const logoPath = path.join(process.cwd(), 'public', 'invoice-logo.png')
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath)
    logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
  }

  try {
    const stream = await renderToStream(
      <SignupDocument 
        customer={customer} 
        logoSrc={logoSrc} 
      />
    )

    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    const fileName = `Signup-Form-${customer.crfNumber || customer.customerCode || 'CRF'}.pdf`
    headers.set('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`)

    return new NextResponse(stream as any, { headers })
  } catch (error: any) {
    console.error('Error generating Signup PDF:', error)
    return NextResponse.json({ error: 'Failed to generate Signup PDF' }, { status: 500 })
  }
}
