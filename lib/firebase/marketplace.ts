'use client';

import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { SEED_LAWYERS, SeedLawyer } from '@/lib/firebase/seed-data';
import { addHistory, createNotification } from '@/lib/firebase/notifications';

const COLLECTION = 'lawyers';

export type Lawyer = SeedLawyer & { uid?: string; certificadoURL?: string; cvURL?: string };

export async function fetchLawyers(): Promise<Lawyer[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, string>;
      return {
        id: d.id,
        name: data.name ?? '',
        role: data.role ?? '',
        city: data.city ?? '',
        rating: data.rating ?? '—',
        reviews: data.reviews ?? '',
        price: data.price ?? '',
        color: data.color ?? '#d8ad96',
        initials: data.initials ?? '?',
        bio: data.bio ?? '',
        education: data.education ?? '',
        experience: data.experience ?? '',
        uid: data.uid ?? '',
        certificadoURL: data.certificadoURL ?? '',
        cvURL: data.cvURL ?? '',
      };
    });
  } catch {
    return [];
  }
}

export interface ConsultationRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  lawyerId: string;
  lawyerName: string;
  status: string;
  createdAt: number;
}

export async function createConsultationRequest(
  uid: string,
  userEmail: string,
  lawyer: Lawyer,
  lawyerEmail?: string
): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  const lawyerUid = (lawyer as Lawyer & { uid?: string }).uid ?? '';
  if (uid === lawyerUid) throw new Error('No puedes solicitar asesoría a ti mismo.');
  await addDoc(collection(db, 'consultationRequests'), {
    clientId: uid,
    clientName: '',
    clientEmail: userEmail,
    lawyerId: lawyerUid,
    lawyerName: lawyer.name,
    status: 'pendiente',
    createdAt: Date.now(),
  });

  const fecha = new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  await Promise.allSettled([
    createNotification(uid, uid, 'asesoria', 'Solicitud de asesoría enviada', `Tu solicitud con ${lawyer.name} (${lawyer.role}) quedó registrada el ${fecha}.`),
    addHistory(uid, 'asesoria', `Solicitó asesoría con ${lawyer.name} (${lawyer.role})`),
  ]);
}

export async function fetchMyRequests(uid: string): Promise<ConsultationRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'consultationRequests'), where('clientId', '==', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        clientId: uid,
        clientName: (data.clientName as string) ?? '',
        clientEmail: (data.clientEmail as string) ?? '',
        lawyerId: (data.lawyerId as string) ?? '',
        lawyerName: (data.lawyerName as string) ?? '',
        status: (data.status as string) ?? 'pendiente',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      };
    });
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
} catch {
  return [];
}
}

export async function updateLawyerPrice(uid: string, price: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  await updateDoc(doc(db, 'lawyers', uid), { price });
}

export async function updateLawyerCity(uid: string, city: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  await updateDoc(doc(db, 'lawyers', uid), { city });
}

