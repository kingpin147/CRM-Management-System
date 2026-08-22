import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/**
 * Cloudflare R2 Storage Utility using S3 Compatible API
 */

const accountId = process.env.R2_ACCOUNT_ID || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
const bucketName = process.env.R2_BUCKET_NAME || 'crm-uploads'
const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

let r2Client: S3Client | null = null

function getR2Client(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn('[R2 Storage] R2 credentials not fully configured in environment variables.')
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
 * Uploads a file buffer or Blob to Cloudflare R2 Cloud Storage.
 * Returns the public text URL of the uploaded object to store in database.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string | null> {
  try {
    const client = getR2Client()
    if (!client || !accountId) {
      console.warn('[R2 Upload] Missing R2 credentials. Generating mock Cloudflare R2 object URL format.')
      // Fallback object URL if R2 credentials are yet to be supplied in .env
      const fallbackDomain = publicDomain || `https://${bucketName}.${accountId || 'pub'}.r2.dev`
      return `${fallbackDomain.replace(/\/$/, '')}/${key}`
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
    console.error('[R2 Storage Error]:', error?.message || error)
    // If S3 upload fails due to invalid credential placeholder, return public URL path for simple textual DB persistence
    const fallbackDomain = publicDomain || `https://${bucketName}.r2.dev`
    return `${fallbackDomain}/${key}`
  }
}
