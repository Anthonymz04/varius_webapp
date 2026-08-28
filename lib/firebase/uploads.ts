'use client';

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!storage) throw new Error('Firebase no está configurado.');
  const fileRef = ref(storage, path);
  const task = uploadBytesResumable(fileRef, file);
  const url = await new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      (error) => reject(error),
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (e) {
          reject(e);
        }
      }
    );
  });
  return url;
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
