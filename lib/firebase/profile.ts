'use client';

import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from './client';

export type UserRole = 'citizen' | 'student' | 'lawyer' | 'admin';

export interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string | null;
  coverURL?: string;
  role?: UserRole;
  university?: string;
  career?: string;
  city?: string;
  bio?: string;
  cedula?: string;
  nationalId?: string;
  certificateURL?: string;
  lawyerEnabled?: boolean;
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch {
    return null;
  }
}

export async function createProfile(input: {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  nationalId?: string;
  certificateURL?: string | null;
}) {
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

export type ProfileFields = Partial<{
  displayName: string;
  role: UserRole;
  university: string;
  career: string;
  city: string;
  bio: string;
  photoURL: string;
  coverURL: string;
  cedula: string;
  nationalId: string;
  certificateURL: string;
  lawyerEnabled: boolean;
}>;

export async function updateProfileFields(uid: string, fields: ProfileFields): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  await setDoc(doc(db, 'users', uid), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
}
