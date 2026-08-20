'use client';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './client';

export type UserRole = 'citizen' | 'student' | 'lawyer';

export async function createProfile(input: { uid: string; name: string; email: string; photoURL?: string | null; role?: UserRole | null }) {
  if (!db) throw new Error('Firebase no está configurado.');
  await setDoc(doc(db, 'users', input.uid), {
    displayName: input.name,
    email: input.email,
    photoURL: input.photoURL ?? null,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    ...(input.role ? { role: input.role } : {}),
  }, { merge: true });
}

export async function updateProfileFields(uid: string, fields: { displayName?: string; role?: UserRole }): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (fields.displayName !== undefined) patch.displayName = fields.displayName;
  if (fields.role !== undefined) patch.role = fields.role;
  await setDoc(doc(db, 'users', uid), patch, { merge: true });
}
