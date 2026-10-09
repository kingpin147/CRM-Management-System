import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { AuditDocument } from './AuditDocument'
import fs from 'fs'
import path from 'path'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const isDownload = searchParams.get('download') === 'true'
  const customerIdParam = searchParams.get('customerId')

  let customer: any = null
  let systemAudit: any = null

  // 1. If explicit customerId provided via query parameter, load customer first
  if (customerIdParam) {
    const isCustomerParamUuid = UUID_REGEX.test(customerIdParam)
    const customerNumericOnly = customerIdParam.replace(/\D/g, '')
    try {
      customer = await prisma.customer.findFirst({
        where: {
          OR: [
            ...(isCustomerParamUuid ? [{ id: customerIdParam }] : []),
            { customerCode: customerIdParam },
            { crfNumber: customerIdParam },
            ...(customerNumericOnly ? [{ customerCode: { contains: customerNumericOnly, mode: 'insensitive' as const } }] : []),
          ]
        },
        include: {
          solarSystem: true,
          packagePlan: true,
          accountExecutive: true,
          assignedInstaller: true,
          systemAudits: {
            include: {
              details: true,
              assignedInstaller: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } catch (err) {
      console.warn('Customer lookup via customerId param failed:', customerIdParam, err)
    }
  }

  // 2. Try looking up as SystemAudit record if not a virtual ID
  if (!id.startsWith('audit-baseline')) {
    const isIdUuid = UUID_REGEX.test(id)
    try {
      systemAudit = await prisma.systemAudit.findFirst({
        where: {
          OR: [
            ...(isIdUuid ? [{ id }] : []),
            { auditNumber: id },
            { auditNumber: { contains: id, mode: 'insensitive' as const } },
          ]
        },
        include: {
          details: true,
          assignedInstaller: true,
          customer: {
            include: {
              solarSystem: true,
              packagePlan: true,
              accountExecutive: true,
              assignedInstaller: true,
            }
          }
        }
      })
    } catch (err) {
      console.warn('SystemAudit lookup failed for id:', id, err)
    }

    if (systemAudit?.customer) {
      customer = systemAudit.customer
    }
  }

  // 3. If customer not yet found, look up customer by id, customerCode, crfNumber, or numeric digits
  if (!customer) {
    const isIdUuid = UUID_REGEX.test(id)
    const numericOnly = id.replace(/\D/g, '')
    try {
      customer = await prisma.customer.findFirst({
        where: {
          OR: [
            ...(isIdUuid ? [{ id }] : []),
            { customerCode: id },
            { crfNumber: id },
            ...(numericOnly.length >= 3 ? [
              { customerCode: { contains: numericOnly, mode: 'insensitive' as const } },
              { crfNumber: { contains: numericOnly, mode: 'insensitive' as const } }
            ] : [])
          ]
        },
        include: {
          solarSystem: true,
          packagePlan: true,
          accountExecutive: true,
          assignedInstaller: true,
          systemAudits: {
            include: {
              details: true,
              assignedInstaller: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } catch (err) {
      console.warn('Customer lookup failed for id:', id, err)
    }
  }

  if (!customer) {
    return new NextResponse('Customer or Audit record not found for System Audit PDF', { status: 404 })
  }

  // If specific audit details exist, merge them for the PDF document
  const activeAudit = systemAudit || (customer.systemAudits && customer.systemAudits.length > 0 ? customer.systemAudits[0] : null)
  if (activeAudit && activeAudit.details && customer.solarSystem) {
    customer = {
      ...customer,
      solarSystem: {
        ...customer.solarSystem,
        inverterStatus: activeAudit.details.inverterStatus || customer.solarSystem.inverterStatus,
        panelStatus: activeAudit.details.panelStatus || customer.solarSystem.panelStatus,
        batteryStatus: activeAudit.details.batteryStatus || customer.solarSystem.batteryStatus,
        structureStatus: activeAudit.details.structureStatus || customer.solarSystem.structureStatus,
        cableStatus: activeAudit.details.cableStatus || customer.solarSystem.cableStatus,
        earthingStatus: activeAudit.details.earthingStatus || customer.solarSystem.earthingStatus,
        breakerStatus: activeAudit.details.breakerStatus || customer.solarSystem.breakerStatus,
        earthingAcOhms: activeAudit.details.earthingAcOhms || customer.solarSystem.earthingAcOhms,
        earthingDcOhms: activeAudit.details.earthingDcOhms || customer.solarSystem.earthingDcOhms,
        installerName: activeAudit.details.installerName || activeAudit.performedBy || customer.solarSystem.installerName,
        lastAuditDate: activeAudit.completedDate || activeAudit.scheduledDate || customer.solarSystem.lastAuditDate,
      }
    }
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
      <AuditDocument 
        customer={customer} 
        logoSrc={logoSrc} 
      />
    )

    // Convert Node stream to Web ReadableStream for reliable Next.js response handling
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      }
    })

    const fileName = `System-Audit-Report-${customer.crfNumber || customer.customerCode || 'Audit'}.pdf`
    const disposition = isDownload ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error: any) {
    console.error('Error generating System Audit PDF:', error)
    return NextResponse.json({ error: 'Failed to generate System Audit PDF', details: error?.message || 'Unknown error' }, { status: 500 })
  }
}

