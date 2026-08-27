'use client';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './client';

export type UserRole = 'citizen' | 'student' | 'lawyer';

export async function createProfile(input: { uid: string; name: string; email: string; photoURL?: string | null; role: UserRole; nationalId?: string; certificateURL?: string | null }) {
  if (!db) throw new Error('Firebase no está configurado.');
  await setDoc(doc(db, 'users', input.uid), {
    displayName: input.name,
    email: input.email,
    photoURL: input.photoURL ?? null,
    role: input.role,
    nationalId: input.nationalId ?? null,
    certificateURL: input.certificateURL ?? null,
    lawyerEnabled: input.role === 'lawyer' && Boolean(input.certificateURL),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
}
