'use client';

import { supabase, STORAGE_BUCKET } from '@/lib/supabase/client';

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  if (onProgress) onProgress(0);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw new Error(error.message);
  if (onProgress) onProgress(100);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadCover(uid: string, file: File, onProgress?: (percent: number) => void) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  return uploadFile(file, `covers/${uid}/cover.${ext}`, onProgress);
}

export function uploadAvatar(uid: string, file: File, onProgress?: (percent: number) => void) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  return uploadFile(file, `avatars/${uid}/avatar.${ext}`, onProgress);
}

export function uploadCertificate(uid: string, file: File, onProgress?: (percent: number) => void) {
  return uploadFile(file, `certifications/${uid}/titulo.pdf`, onProgress);
}

export function uploadCV(uid: string, file: File, onProgress?: (percent: number) => void) {
  return uploadFile(file, `cvs/${uid}/hoja-vida.pdf`, onProgress);
}

export function uploadChatFile(conversacionId: string, file: File, onProgress?: (percent: number) => void) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 60);
  const ts = Date.now();
  return uploadFile(file, `chat/${conversacionId}/${ts}-${safeName}`, onProgress);
}
