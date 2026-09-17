'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export interface LawyerReview {
  id: string;
  lawyerId: string;
  lawyerUid: string;
  authorUid: string;
  authorName: string;
  rating: number;
  comment: string;
  updatedAt: number;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

const REVIEWS = 'lawyer_reviews';
const FAVORITES = 'lawyer_favorites';

export async function fetchAllReviews(): Promise<LawyerReview[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, REVIEWS));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        lawyerId: (data.lawyerId as string) ?? '',
        lawyerUid: (data.lawyerUid as string) ?? '',
        authorUid: (data.authorUid as string) ?? '',
        authorName: (data.authorName as string) ?? 'Usuario VARIUS',
        rating: Number(data.rating) || 0,
        comment: (data.comment as string) ?? '',
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      };
    });
  } catch {
    return [];
  }
}

export function summarizeReviews(reviews: LawyerReview[]): ReviewSummary {
  if (!reviews.length) return { average: 0, count: 0 };
  const total = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

export async function submitLawyerReview(input: {
  lawyerId: string;
  lawyerUid: string;
  authorUid: string;
  authorName: string;
  rating: number;
  comment: string;
}): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  const id = `${input.lawyerId}_${input.authorUid}`;
  await setDoc(doc(db, REVIEWS, id), {
    lawyerId: input.lawyerId,
    lawyerUid: input.lawyerUid,
    authorUid: input.authorUid,
    authorName: input.authorName,
    rating: input.rating,
    comment: input.comment,
    updatedAt: Date.now(),
    createdAt: serverTimestamp(),
  });
}

export async function deleteLawyerReview(lawyerId: string, authorUid: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  await deleteDoc(doc(db, REVIEWS, `${lawyerId}_${authorUid}`));
}

export async function fetchFavoriteIds(uid: string): Promise<string[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, FAVORITES), where('uid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data().lawyerId as string) ?? '').filter(Boolean);
  } catch {
    return [];
  }
}

export async function isFavorite(uid: string, lawyerId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, FAVORITES, `${uid}_${lawyerId}`));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function toggleFavorite(uid: string, lawyerId: string): Promise<boolean> {
  if (!db) throw new Error('Firebase no está configurado');
  const id = `${uid}_${lawyerId}`;
  const ref = doc(db, FAVORITES, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { uid, lawyerId, createdAt: serverTimestamp() });
  return true;
}
