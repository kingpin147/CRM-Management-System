import { NextRequest, NextResponse } from 'next/server'
import { getR2Client, bucketName } from '@/utils/r2/storage'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const pathSegments = resolvedParams.path || []
    const key = pathSegments.join('/')

    if (!key) {
      return new NextResponse('File path required', { status: 400 })
    }

    // 1. Check local public/uploads directory first
    const localFilePath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments)
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath)
      if (stats.isFile()) {
        const fileBuffer = await fs.promises.readFile(localFilePath)
        const contentType = getContentType(localFilePath)
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': stats.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    // 2. Fallback: Stream from Cloudflare R2 if configured
    const r2 = getR2Client()
    if (r2) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
        const response = await r2.send(command)
        if (response.Body) {
          const stream = response.Body.transformToWebStream()
          return new NextResponse(stream as any, {
            headers: {
              'Content-Type': response.ContentType || getContentType(key),
              'Content-Length': response.ContentLength?.toString() || '',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        }
      } catch (r2Err: any) {
        console.warn(`[API Uploads] R2 fetch error for key: ${key}:`, r2Err?.message)
      }
    }

    return new NextResponse('File not found', { status: 404 })
  } catch (err: any) {
    console.error('[API Uploads Error]:', err)
    return new NextResponse('Server Error', { status: 500 })
  }
}
