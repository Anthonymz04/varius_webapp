'use client';

import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from './client';

export type UserRole = 'citizen' | 'student' | 'lawyer';

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
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const d = snap.data() as UserProfile;
    return d;
  } catch {
    return null;
  }
}

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

export interface ProfileFields {
  displayName?: string;
  role?: UserRole;
  university?: string;
  career?: string;
  city?: string;
  bio?: string;
  photoURL?: string;
  coverURL?: string;
  cedula?: string;
}

export async function updateProfileFields(uid: string, fields: ProfileFields): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (fields.displayName !== undefined) patch.displayName = fields.displayName;
  if (fields.role !== undefined) patch.role = fields.role;
  if (fields.university !== undefined) patch.university = fields.university;
  if (fields.career !== undefined) patch.career = fields.career;
  if (fields.city !== undefined) patch.city = fields.city;
  if (fields.bio !== undefined) patch.bio = fields.bio;
  if (fields.photoURL !== undefined) patch.photoURL = fields.photoURL;
  if (fields.coverURL !== undefined) patch.coverURL = fields.coverURL;
  if (fields.cedula !== undefined) patch.cedula = fields.cedula;
  await setDoc(doc(db, 'users', uid), patch, { merge: true });
}
