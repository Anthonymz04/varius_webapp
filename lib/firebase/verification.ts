'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './client';

export type VerificationStatus = 'pendiente' | 'aprobada' | 'rechazada';

export interface LawyerVerification {
  uid: string;
  fullName: string;
  email: string;
  registryNumber: string;
  university: string;
  yearsExperience: string;
  bio: string;
  price: string;
  status: VerificationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface VerificationInput {
  fullName: string;
  registryNumber: string;
  university: string;
  yearsExperience: string;
  bio: string;
  price: string;
}

export async function submitLawyerVerification(
  uid: string,
  email: string,
  input: VerificationInput
): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  const now = Date.now();
  await setDoc(doc(db, 'lawyer_verifications', uid), {
    uid,
    email,
    fullName: input.fullName.trim(),
    registryNumber: input.registryNumber.trim(),
    university: input.university.trim(),
    yearsExperience: input.yearsExperience.trim(),
    bio: input.bio.trim(),
    price: input.price.trim(),
    status: 'pendiente' as VerificationStatus,
    createdAt: now,
    updatedAt: now,
  });
}

export async function fetchLawyerVerification(uid: string): Promise<LawyerVerification | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'lawyer_verifications', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uid,
      fullName: (d.fullName as string) ?? '',
      email: (d.email as string) ?? '',
      registryNumber: (d.registryNumber as string) ?? '',
      university: (d.university as string) ?? '',
      yearsExperience: (d.yearsExperience as string) ?? '',
      bio: (d.bio as string) ?? '',
      price: (d.price as string) ?? '',
      status: (d.status as VerificationStatus) ?? 'pendiente',
      createdAt: typeof d.createdAt === 'number' ? d.createdAt : Date.now(),
      updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}
