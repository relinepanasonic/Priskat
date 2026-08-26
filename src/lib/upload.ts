import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_MB = 2;
const MAX_WIDTH_PX = 1200;

/**
 * Compress and resize an image client-side, then upload to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(
  file: File,
  bucket: "avatars" | "news-covers" | "event-banners" | "devotion-covers",
  path: string
): Promise<string> {
  // 1. Compress/resize
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_PX,
    useWebWorker: true,
    fileType: "image/webp",
  });

  // 2. Upload
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, compressed, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // 3. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

/** Generate a unique storage path for a user's file */
export function storagePath(userId: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "webp";
  const timestamp = Date.now();
  return `${userId}/${timestamp}.${ext}`;
}

