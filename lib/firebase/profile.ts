'use client';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './client';

export type UserRole = 'citizen' | 'student' | 'lawyer';

export async function createProfile(input: { uid: string; name: string; email: string; photoURL?: string | null; role: UserRole }) {
  if (!db) throw new Error('Firebase no está configurado.');
  await setDoc(doc(db, 'users', input.uid), {
    displayName: input.name,
    email: input.email,
    photoURL: input.photoURL ?? null,
    role: input.role,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
}
