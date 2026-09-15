import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

/**
 * Multi-Tier Cloud Storage Utility:
 * Tier 1: Cloudflare R2 Cloud Storage (if R2 credentials provided)
 * Tier 2: Supabase Storage Cloud Bucket (automatic cloud fallback for Vercel/Production)
 * Tier 3: Local Filesystem Storage (public/uploads fallback for local dev)
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
 * Uploads to Supabase Cloud Storage Bucket
 */
async function uploadToSupabaseStorage(fileBuffer: Buffer, key: string, contentType: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'crm-uploads'

    if (!supabaseUrl || !supabaseKey) return null

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.storage.from(supabaseBucket).upload(key, fileBuffer, {
      contentType: contentType || 'image/jpeg',
      upsert: true
    })

    if (error) {
      console.warn('[Supabase Storage Upload Warning]:', error.message)
      return null
    }

    const { data: publicData } = supabase.storage.from(supabaseBucket).getPublicUrl(key)
    return publicData.publicUrl
  } catch (err: any) {
    console.warn('[Supabase Storage Exception]:', err?.message || err)
    return null
  }
}

/**
 * Saves uploaded file locally into public/uploads for local development
 */
async function saveToLocalUploads(fileBuffer: Buffer, key: string): Promise<string | null> {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', path.dirname(key))
    await fs.promises.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(process.cwd(), 'public', 'uploads', key)
    await fs.promises.writeFile(filePath, fileBuffer)
    return `/uploads/${key}`
  } catch (err) {
    // Vercel serverless functions have a read-only filesystem
    return null
  }
}

export { getR2Client, bucketName, saveToLocalUploads }

/**
 * Uploads a file buffer to Cloudflare R2, Supabase Cloud Storage, or Local storage.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string | null> {
  // Always save to local public/uploads for instant local availability
  const localUrl = await saveToLocalUploads(fileBuffer, key)

  // 1. Try Cloudflare R2 if configured
  try {
    const client = getR2Client()
    if (client && accountId) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })

      await client.send(command)

      if (publicDomain) {
        return `${publicDomain.replace(/\/$/, '')}/${key}`
      }
      
      // If no custom publicDomain is provided, return localUrl or internal proxy URL to avoid r2.dev subdomain 401/DNS failures
      return localUrl || `/api/uploads/${key}`
    }
  } catch (r2Err: any) {
    console.warn('[R2 Storage Error, attempting Supabase fallback]:', r2Err?.message || r2Err)
  }

  // 2. Try Supabase Cloud Storage
  const supabaseUrl = await uploadToSupabaseStorage(fileBuffer, key, contentType)
  if (supabaseUrl) {
    return supabaseUrl
  }

  // 3. Fallback to local uploads (for offline/local dev)
  if (localUrl) {
    return localUrl
  }

  // 4. Data URI fallback as a last resort if all cloud & local storages fail
  const base64 = fileBuffer.toString('base64')
  return `data:${contentType || 'image/jpeg'};base64,${base64}`
}
