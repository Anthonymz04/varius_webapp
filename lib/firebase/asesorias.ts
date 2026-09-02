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
  if (input.clientId === input.lawyerId) throw new Error('No puedes solicitar asesoría a ti mismo.');
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
  await Promise.allSettled([
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
    const q = query(collection(db, 'consultationRequests'), where('lawyerId', '==', lawyerUid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as AsesoriaRequest;
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  } catch { return []; }
}

export async function fetchClientRequests(clientUid: string): Promise<AsesoriaRequest[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'consultationRequests'), where('clientId', '==', clientUid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as AsesoriaRequest;
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
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
  status?: 'activa' | 'finalizada';
}

export type Mensaje = {
  id: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
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
    status: 'activa',
  });
  await updateDoc(doc(db, 'consultationRequests', input.requestId), { conversacionId: docRef.id, status: 'aceptada' });
  await Promise.allSettled([
    createNotification(input.clientId, input.lawyerId, 'asesoria', 'Asesoría aceptada', `${input.lawyerName} aceptó tu solicitud de asesoría.`),
    addHistory(input.clientId, 'asesoria', `Asesoría aceptada por ${input.lawyerName}`),
  ]);
  return docRef.id;
}

export async function sendMessage(conversacionId: string, senderId: string, text: string, senderName?: string, senderPhotoURL?: string) {
  if (!db) return;
  const msgRef = collection(db, 'conversations', conversacionId, 'messages');
  await addDoc(msgRef, { senderId, senderName: senderName ?? '', senderPhotoURL: senderPhotoURL ?? '', text, createdAt: Date.now() });
  await updateDoc(doc(db, 'conversations', conversacionId), {
    lastMessage: text,
    lastMessageAt: Date.now(),
  });
}

export async function finalizarConversacion(conversacionId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'conversations', conversacionId), {
    status: 'finalizada',
    lastMessage: 'Asesoría finalizada',
    lastMessageAt: Date.now(),
  });
}

export async function fetchMessages(conversacionId: string): Promise<Mensaje[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'conversations', conversacionId, 'messages'), orderBy('createdAt', 'asc'), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        senderId: (data.senderId as string) ?? '',
        senderName: (data.senderName as string) ?? '',
        senderPhotoURL: (data.senderPhotoURL as string) ?? '',
        text: (data.text as string) ?? '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      };
    });
  } catch { return []; }
}

export function subscribeMessages(conversacionId: string, cb: (msgs: Mensaje[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'conversations', conversacionId, 'messages'), orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      id: d.id,
      senderId: (d.data().senderId as string) ?? '',
      senderName: (d.data().senderName as string) ?? '',
      senderPhotoURL: (d.data().senderPhotoURL as string) ?? '',
      text: (d.data().text as string) ?? '',
      createdAt: typeof d.data().createdAt === 'number' ? d.data().createdAt : Date.now(),
    }));
    cb(msgs);
  }, () => cb([]));
}

export async function fetchConversaciones(uid: string): Promise<Conversacion[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as Conversacion;
    });
    list.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    return list;
  } catch { return []; }
}

export function subscribeConversaciones(uid: string, cb: (list: Conversacion[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as Conversacion;
    });
    list.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    cb(list);
  }, () => {});
}

export function subscribeRequests(uid: string, cb: (list: AsesoriaRequest[]) => void): () => void {
  if (!db) return () => {};
  const store = new Map<string, AsesoriaRequest>();
  const emit = () => {
    const list = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt);
    cb(list);
  };
  const handle = (snap: { docs: { data: () => unknown; id: string }[] }) => {
    snap.docs.forEach((d) => {
      const data = d.data() as object;
      store.set(d.id, { id: d.id, ...data } as AsesoriaRequest);
    });
    emit();
  };
  const handleRemove = (snap: { docChanges: () => { type: string; doc: { data: () => unknown; id: string } }[] }) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'removed') store.delete(change.doc.id);
    });
    emit();
  };
  const unsubs: (() => void)[] = [
    onSnapshot(query(collection(db, 'consultationRequests'), where('clientId', '==', uid)), (s) => { handle(s); handleRemove(s as never); }, () => {}),
    onSnapshot(query(collection(db, 'consultationRequests'), where('lawyerId', '==', uid)), (s) => { handle(s); handleRemove(s as never); }, () => {}),
  ];
  return () => unsubs.forEach((u) => u());
}