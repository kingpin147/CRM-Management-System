import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/utils/r2/storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'equipment'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop() || 'jpg'
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${Date.now()}_${safeName}`

    const publicUrl = await uploadToR2(buffer, key, file.type || 'image/jpeg')

    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to upload to Cloudflare R2' }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl, key })
  } catch (error: any) {
    console.error('R2 API Upload Error:', error)
    return NextResponse.json({ error: error?.message || 'Server error uploading file' }, { status: 500 })
  }
}
