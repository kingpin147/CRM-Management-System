import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

/**
 * Cloudflare R2 Storage Utility using S3 Compatible API with local filesystem fallback
 */

const accountId = process.env.R2_ACCOUNT_ID || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
const bucketName = process.env.R2_BUCKET_NAME || 'crm-uploads'
const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

let r2Client: S3Client | null = null

function getR2Client(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null
  }
  
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    })
  }
  return r2Client
}

/**
 * Saves uploaded file locally into public/uploads for direct serving
 */
async function saveToLocalUploads(fileBuffer: Buffer, key: string): Promise<string> {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', path.dirname(key))
    await fs.promises.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(process.cwd(), 'public', 'uploads', key)
    await fs.promises.writeFile(filePath, fileBuffer)
    return `/uploads/${key}`
  } catch (err) {
    console.error('[Local Storage Write Error]:', err)
    return `/uploads/${key}`
  }
}

/**
 * Uploads a file buffer or Blob to Cloudflare R2 Cloud Storage.
 * Falls back to local public uploads if R2 credentials are not set.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string | null> {
  try {
    const client = getR2Client()
    if (!client || !accountId) {
      // Save locally to public/uploads so the file is immediately accessible and viewable
      return await saveToLocalUploads(fileBuffer, key)
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })

    await client.send(command)

    // Format public URL
    const baseUrl = publicDomain
      ? publicDomain.replace(/\/$/, '')
      : `https://${bucketName}.${accountId}.r2.dev`
    
    return `${baseUrl}/${key}`
  } catch (error: any) {
    console.error('[R2 Storage Error, falling back to local storage]:', error?.message || error)
    return await saveToLocalUploads(fileBuffer, key)
  }
}
