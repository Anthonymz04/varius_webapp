'use client';

import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { SEED_TUTORIAS, SeedTutorialia } from '@/lib/firebase/seed-data';
import { addHistory, createNotification } from '@/lib/firebase/notifications';

export type Tutorialia = SeedTutorialia;

export function getTutorias(): Tutorialia[] {
  return SEED_TUTORIAS;
}

export interface TutorReserva {
  id: string;
  uid: string;
  userEmail: string;
  tutoriaId: string;
  tutoriaTitle: string;
  fecha: string;
  hora: string;
  createdAt: number;
}

export async function crearReserva(
  uid: string,
  userEmail: string,
  tutoria: Tutorialia,
  fecha: string,
  hora: string
): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  await addDoc(collection(db, 'tutoria_reservas'), {
    uid,
    userEmail,
    tutoriaId: tutoria.id,
    tutoriaTitle: tutoria.title,
    fecha,
    hora,
    status: 'confirmada',
    createdAt: Date.now(),
  });

  await Promise.all([
    createNotification(
      uid,
      uid,
      'tutoria',
      'Tutoría reservada',
      `Reservaste "${tutoria.title}" con ${tutoria.tutor} para el ${fecha} a las ${hora}.`
    ),
    addHistory(uid, 'tutoria', `Reservó la tutoría "${tutoria.title}" (${fecha} ${hora})`),
  ]);
}

export async function fetchMisReservas(uid: string): Promise<TutorReserva[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'tutoria_reservas'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid,
        userEmail: (data.userEmail as string) ?? '',
        tutoriaId: (data.tutoriaId as string) ?? '',
        tutoriaTitle: (data.tutoriaTitle as string) ?? '',
        fecha: (data.fecha as string) ?? '',
        hora: (data.hora as string) ?? '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      };
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  } catch {
    return [];
  }
}
