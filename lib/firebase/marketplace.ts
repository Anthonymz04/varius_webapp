'use client';

import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { SEED_LAWYERS, SeedLawyer } from '@/lib/firebase/seed-data';
import { addHistory, createNotification } from '@/lib/firebase/notifications';

const COLLECTION = 'lawyers';

export type Lawyer = SeedLawyer & { uid?: string };

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
      };
    });
  } catch {
    return [];
  }
}

export interface ConsultationRequest {
  id: string;
  uid: string;
  userEmail: string;
  lawyerId: string;
  lawyerName: string;
  createdAt: number;
}

export async function createConsultationRequest(
  uid: string,
  userEmail: string,
  lawyer: Lawyer,
  lawyerEmail?: string
): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  await addDoc(collection(db, 'lawyer_requests'), {
    uid,
    userEmail,
    lawyerId: lawyer.id,
    lawyerName: lawyer.name,
    lawyerEmail: lawyerEmail ?? null,
    status: 'pendiente',
    createdAt: Date.now(),
  });

  const fecha = new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  await Promise.all([
    createNotification(
      uid,
      'asesoria',
      'Solicitud de asesoría enviada',
      `Tu solicitud con ${lawyer.name} (${lawyer.role}) quedó registrada el ${fecha}.`
    ),
    addHistory(uid, 'asesoria', `Solicitó asesoría con ${lawyer.name} (${lawyer.role})`),
  ]);
}

export async function fetchMyRequests(uid: string): Promise<ConsultationRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'lawyer_requests'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid,
        userEmail: (data.userEmail as string) ?? '',
        lawyerId: (data.lawyerId as string) ?? '',
        lawyerName: (data.lawyerName as string) ?? '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      };
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  } catch {
    return [];
  }
}
