'use client';

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface ConsultationMessage {
  from: 'ai' | 'user';
  text: string;
}

export interface Consultation {
  id: string;
  uid: string;
  title: string;
  messages: ConsultationMessage[];
  updatedAt: number;
}

const COLLECTION = 'consultations';

export async function fetchConsultations(uid: string): Promise<Consultation[]> {
  if (!db) return [];
  const q = query(collection(db, COLLECTION), where('uid', '==', uid));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid,
      title: (data.title as string) || 'Consulta',
      messages: (data.messages as ConsultationMessage[]) || [],
      updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
    };
  });
  list.sort((a, b) => b.updatedAt - a.updatedAt);
  return list.slice(0, 20);
}

export async function saveConsultation(
  uid: string,
  title: string,
  messages: ConsultationMessage[],
  existingId?: string | null
): Promise<string | null> {
  if (!db) return null;
  const payload = { uid, title, messages, updatedAt: Date.now() };
  if (existingId) {
    await updateDoc(doc(db, COLLECTION, existingId), payload);
    return existingId;
  }
  const ref = await addDoc(collection(db, COLLECTION), { ...payload, createdAt: Date.now() });
  return ref.id;
}
