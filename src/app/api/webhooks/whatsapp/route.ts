import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 1. Webhook Verification for Meta App Setup
 * Meta sends a GET request to verify the webhook URL with hub.verify_token and hub.challenge
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'energy_gurus_crm_webhook_secure_token_2026'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful')
    return new Response(challenge || '', { status: 200 })
  }

  console.warn('[WhatsApp Webhook] Verification failed for token:', token)
  return new Response('Forbidden', { status: 403 })
}

/**
 * 2. Real-time Status & Inbound Events Listener
 * Meta sends status callbacks: sent -> delivered -> read -> failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]?.value

    // Process Status Updates
    if (changes?.statuses && Array.isArray(changes.statuses)) {
      for (const statusObj of changes.statuses) {
        const wamid = statusObj.id
        const metaStatus = (statusObj.status || '').toLowerCase()

        let status = 'SENT'
        const updateData: any = {}

        if (metaStatus === 'delivered') {
          status = 'DELIVERED'
          updateData.deliveredAt = statusObj.timestamp ? new Date(Number(statusObj.timestamp) * 1000) : new Date()
        } else if (metaStatus === 'read') {
          status = 'READ'
          updateData.openedAt = statusObj.timestamp ? new Date(Number(statusObj.timestamp) * 1000) : new Date()
        } else if (metaStatus === 'failed') {
          status = 'FAILED'
          updateData.errorDetails = JSON.stringify(statusObj.errors || statusObj)
        }

        updateData.status = status

        if (wamid) {
          await prisma.communicationLog.updateMany({
            where: { externalId: wamid },
            data: updateData,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[WhatsApp Webhook Exception]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
