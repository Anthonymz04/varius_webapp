'use client';

import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './client';
import { addHistory, createNotification } from './notifications';

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
  cedula: string;
  certificadoURL: string;
  cvURL: string;
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
  cedula: string;
  certificadoURL: string;
  cvURL: string;
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
    cedula: input.cedula.trim(),
    certificadoURL: input.certificadoURL,
    cvURL: input.cvURL,
    status: 'pendiente' as VerificationStatus,
    createdAt: now,
    updatedAt: now,
  });
  const admins = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
  await Promise.all([
    ...admins.docs.map((a) =>
      createNotification(
        a.id,
        uid,
        'cuenta',
        'Nueva verificación pendiente',
        `${input.fullName.trim()} solicitó verificación de abogado. Revisala en el panel /admin.`
      )
    ),
    ...admins.docs.map((a) =>
      addHistory(a.id, 'cuenta', `Recibió solicitud de verificación de ${input.fullName.trim()}`)
    ),
    addHistory(uid, 'cuenta', 'Envió solicitud de verificación de abogado'),
  ]);
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
      cedula: (d.cedula as string) ?? '',
      certificadoURL: (d.certificadoURL as string) ?? '',
      cvURL: (d.cvURL as string) ?? '',
      status: (d.status as VerificationStatus) ?? 'pendiente',
      createdAt: typeof d.createdAt === 'number' ? d.createdAt : Date.now(),
      updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}
