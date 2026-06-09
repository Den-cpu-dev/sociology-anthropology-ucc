import { randomUUID } from 'crypto';
import { getSupabase } from './db.js';

const BUCKET = 'election-photos';

/**
 * Upload base64 data URL to Supabase Storage. Returns public URL.
 */
export async function uploadCandidatePhoto(dataUrl) {
  const supabase = getSupabase();
  const match = String(dataUrl).match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('invalid_image_format');
  }

  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 4 * 1024 * 1024) {
    throw new Error('image_too_large');
  }

  let ext = contentType.split('/')[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  const path = `candidates/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export { BUCKET };
