'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';

const NOTIFICATIONS = 'notifications';
const HISTORY = 'actionHistory';
const MAIL = 'mail';

export type NotificationType = 'asesoria' | 'tutoria' | 'cuenta' | 'perfil' | 'info';

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType | string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  userId: string;
  type: NotificationType | string;
  title: string;
  createdAt: number;
}

export async function createNotification(
  recipientUid: string,
  actorUid: string,
  type: NotificationType,
  title: string,
  body: string
): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, NOTIFICATIONS), { userId: recipientUid, actorId: auth?.currentUser?.uid ?? actorUid, type, title, body, read: false, createdAt: Date.now() });
}

export async function addHistory(uid: string, type: NotificationType, title: string): Promise<void> {
  if (!db) return;
  const actor = auth?.currentUser?.uid ?? uid;
  await addDoc(collection(db, HISTORY), { userId: uid, type, title, createdAt: Date.now(), actorId: actor });
}

export async function fetchHistory(uid: string): Promise<HistoryItem[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, HISTORY), where('userId', '==', uid), limit(50));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: uid,
        type: (data.type as string) ?? 'info',
        title: (data.title as string) ?? '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
      };
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  } catch {
    return [];
  }
}

export function subscribeNotifications(
  uid: string,
  onChange: (list: AppNotification[]) => void
): () => void {
  if (!db) return () => {};
  const q = query(collection(db, NOTIFICATIONS), where('userId', '==', uid), limit(20));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: uid,
          actorId: (data.actorId as string) ?? '',
          type: (data.type as string) ?? 'info',
          title: (data.title as string) ?? '',
          body: (data.body as string) ?? '',
          read: data.read === true,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        };
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      onChange(list);
    },
    () => onChange([])
  );
}

export async function markNotificationsRead(items: AppNotification[]): Promise<void> {
  if (!db) return;
  await Promise.all(
    items
      .filter((n) => !n.read)
      .map((n) => updateDoc(doc(db!, NOTIFICATIONS, n.id), { read: true }).catch(() => {}))
  );
}

export async function deleteNotification(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, NOTIFICATIONS, id));
}

export async function queueEmail(actorId: string, to: string[], subject: string, text: string): Promise<void> {
  if (!db || to.length === 0) return;
  await addDoc(collection(db, MAIL), {
    actorId,
    to,
    message: { subject, text },
    createdAt: Date.now(),
  });
}
