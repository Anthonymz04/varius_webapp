'use client';

import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { addHistory, createNotification } from '@/lib/firebase/notifications';

/* ─── Peticiones de asesoría ─── */

export interface AsesoriaRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  lawyerId: string;
  lawyerName: string;
  topic: string;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
  conversacionId?: string;
  createdAt: number;
  updatedAt: number;
}

export async function createRequest(input: {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lawyerId: string;
  lawyerName: string;
  topic?: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase no está configurado.');
  const docRef = await addDoc(collection(db, 'consultationRequests'), {
    clientId: input.clientId,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    lawyerId: input.lawyerId,
    lawyerName: input.lawyerName,
    topic: input.topic ?? '',
    status: 'pendiente',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  await Promise.all([
    createNotification(input.clientId, input.clientId, 'asesoria', 'Solicitud de asesoría enviada', `Se solicitó asesoría con ${input.lawyerName}.`),
    addHistory(input.clientId, 'asesoria', `Solicitó asesoría con ${input.lawyerName}`),
    createNotification(input.lawyerId, input.clientId, 'asesoria', `${input.clientName} busca asesoría`, `${input.clientName} te ha solicitado una asesoría jurídica.`),
    addHistory(input.lawyerId, 'asesoria', `Recibió solicitud de ${input.clientName}`),
  ]);
  return docRef.id;
}

export async function fetchLawyerRequests(lawyerUid: string): Promise<AsesoriaRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'consultationRequests'), where('lawyerId', '==', lawyerUid), orderBy('createdAt', 'desc'));
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
    const q = query(collection(db, 'consultationRequests'), where('clientId', '==', clientUid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as AsesoriaRequest;
    });
  } catch { return []; }
}

export async function updateRequestStatus(requestId: string, status: 'aceptada' | 'rechazada') {
  if (!db) return;
  await updateDoc(doc(db, 'consultationRequests', requestId), { status, updatedAt: Date.now() });
}

/* ─── Conversaciones (chat persistente) ─── */

export interface Conversacion {
  id: string;
  participantIds: string[];
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  lastMessage: string;
  lastMessageAt: number;
  createdAt: number;
}

export type Mensaje = {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
};

export async function createConversacion(input: {
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  requestId: string;
}): Promise<string> {
  if (!db) throw new Error('Firebase no está configurado.');
  const docRef = await addDoc(collection(db, 'conversations'), {
    participantIds: [input.clientId, input.lawyerId],
    clientId: input.clientId,
    clientName: input.clientName,
    lawyerId: input.lawyerId,
    lawyerName: input.lawyerName,
    lastMessage: 'Asesoría iniciada',
    lastMessageAt: Date.now(),
    createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'consultationRequests', input.requestId), { conversacionId: docRef.id, status: 'aceptada' });
  await Promise.all([
    createNotification(input.clientId, input.lawyerId, 'asesoria', 'Asesoría aceptada', `${input.lawyerName} aceptó tu solicitud de asesoría.`),
    addHistory(input.clientId, 'asesoria', `Asesoría aceptada por ${input.lawyerName}`),
  ]);
  return docRef.id;
}

export async function sendMessage(conversacionId: string, senderId: string, text: string) {
  if (!db) return;
  const msgRef = collection(db, 'conversations', conversacionId, 'messages');
  await addDoc(msgRef, { senderId, text, createdAt: Date.now() });
  await updateDoc(doc(db, 'conversations', conversacionId), {
    lastMessage: text,
    lastMessageAt: Date.now(),
  });
}

export function subscribeMessages(conversacionId: string, cb: (msgs: Mensaje[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'conversations', conversacionId, 'messages'), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      id: d.id,
      senderId: (d.data().senderId as string) ?? '',
      text: (d.data().text as string) ?? '',
      createdAt: typeof d.data().createdAt === 'number' ? d.data().createdAt : Date.now(),
    }));
    cb(msgs);
  }, () => cb([]));
}

export async function fetchConversaciones(uid: string): Promise<Conversacion[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', uid), orderBy('lastMessageAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as Conversacion;
    });
  } catch { return []; }
}