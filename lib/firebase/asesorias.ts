'use client';

import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { addHistory, createNotification } from '@/lib/firebase/notifications';

/* ─── Peticiones de asesoría ─── */

export interface AsesoriaRequest {
  id: string;
  clientUid: string;
  clientName: string;
  clientEmail: string;
  lawyerId: string;
  lawyerUid: string;
  lawyerName: string;
  topic: string;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
  createdAt: number;
  updatedAt: number;
}

export async function createRequest(input: {
  clientUid: string;
  clientName: string;
  clientEmail: string;
  lawyerId: string;
  lawyerUid: string;
  lawyerName: string;
  topic?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase no está configurado.');
  const docRef = await addDoc(collection(db, 'lawyer_requests'), {
    clientUid: input.clientUid,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    lawyerId: input.lawyerId,
    lawyerUid: input.lawyerUid,
    lawyerName: input.lawyerName,
    topic: input.topic ?? '',
    status: 'pendiente',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  await Promise.all([
    createNotification(input.clientUid, 'asesoria', 'Solicitud de asesoría enviada', `Se solicitó asesoría con ${input.lawyerName}.`),
    addHistory(input.clientUid, 'asesoria', `Solicitó asesoría con ${input.lawyerName}`),
    createNotification(input.lawyerUid, 'asesoria', `${input.clientName} busca asesoría`, `${input.clientName} te ha solicitado una asesoría jurídica.`),
    addHistory(input.lawyerUid, 'asesoria', `Recibió solicitud de ${input.clientName}`),
  ]);
  return docRef.id;
}

export async function fetchLawyerRequests(lawyerUid: string): Promise<AsesoriaRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'lawyer_requests'), where('lawyerUid', '==', lawyerUid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as AsesoriaRequest;
    });
  } catch { return []; }
}

export async function fetchClientRequests(clientUid: string): Promise<AsesoriaRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'lawyer_requests'), where('clientUid', '==', clientUid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as AsesoriaRequest;
    });
  } catch { return []; }
}

export async function updateRequestStatus(requestId: string, status: 'aceptada' | 'rechazada') {
  if (!db) return;
  await updateDoc(doc(db, 'lawyer_requests', requestId), { status, updatedAt: Date.now() });
}

/* ─── Conversaciones (chat persistente) ─── */

export interface Conversacion {
  id: string;
  participants: string[];
  clientUid: string;
  clientName: string;
  lawyerUid: string;
  lawyerName: string;
  lastMessage: string;
  lastMessageAt: number;
  createdAt: number;
}

export type Mensaje = {
  id: string;
  from: string;
  text: string;
  createdAt: number;
};

export async function createConversacion(input: {
  clientUid: string;
  clientName: string;
  lawyerUid: string;
  lawyerName: string;
  requestId: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase no está configurado.');
  const docRef = await addDoc(collection(db, 'conversaciones'), {
    participants: [input.clientUid, input.lawyerUid],
    clientUid: input.clientUid,
    clientName: input.clientName,
    lawyerUid: input.lawyerUid,
    lawyerName: input.lawyerName,
    lastMessage: 'Asesoría iniciada',
    lastMessageAt: Date.now(),
    createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'lawyer_requests', input.requestId), { conversacionId: docRef.id });
  await Promise.all([
    createNotification(input.clientUid, 'asesoria', 'Asesoría aceptada', `${input.lawyerName} aceptó tu solicitud de asesoría.`),
    addHistory(input.clientUid, 'asesoria', `Asesoría aceptada por ${input.lawyerName}`),
  ]);
  return docRef.id;
}

export async function sendMessage(conversacionId: string, from: string, text: string) {
  if (!db) return;
  const msgRef = collection(db, 'conversaciones', conversacionId, 'messages');
  await addDoc(msgRef, { from, text, createdAt: Date.now() });
  await updateDoc(doc(db, 'conversaciones', conversacionId), {
    lastMessage: text,
    lastMessageAt: Date.now(),
  });
}

export function subscribeMessages(conversacionId: string, cb: (msgs: Mensaje[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'conversaciones', conversacionId, 'messages'), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      id: d.id,
      from: (d.data().from as string) ?? '',
      text: (d.data().text as string) ?? '',
      createdAt: typeof d.data().createdAt === 'number' ? d.data().createdAt : Date.now(),
    }));
    cb(msgs);
  }, () => cb([]));
}

export async function fetchConversaciones(uid: string): Promise<Conversacion[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'conversaciones'), where('participants', 'array-contains', uid), orderBy('lastMessageAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as Conversacion;
    });
  } catch { return []; }
}