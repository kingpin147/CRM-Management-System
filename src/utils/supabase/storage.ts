import { createClient } from './client'

export async function uploadFile(file: File, bucketName: string, path: string): Promise<string | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Storage Upload Error:', error.message)
    return null
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}
