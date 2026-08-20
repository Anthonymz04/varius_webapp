'use client';

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { SEED_POSTS } from '@/lib/firebase/seed-data';

const POSTS = 'community_posts';
const COMMENTS = 'community_comments';

export interface Post {
  id: string;
  author: string;
  authorUid: string;
  initials: string;
  color: string;
  body: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: number;
}

export interface PostComment {
  id: string;
  author: string;
  body: string;
  createdAt: number;
}

export const POST_COLORS = ['#d8ad96', '#7e907d', '#9f7f8c', '#8b7d9b', '#d89696', '#7d8e90'];

async function seedPostsIfEmpty(): Promise<void> {
  if (!db) return;
  const snap = await getDocs(query(collection(db, POSTS), limit(1)));
  if (!snap.empty) return;
  await Promise.all(
    SEED_POSTS.map((p) =>
      addDoc(collection(db!, POSTS), {
        author: p.author,
        authorUid: 'seed',
        initials: p.initials,
        color: p.color,
        body: p.body,
        tags: p.tags,
        likeCount: p.likeCount,
        likedBy: [],
        commentCount: p.commentCount,
        createdAt: p.createdAt,
      })
    )
  );
}

export async function fetchPosts(uid?: string): Promise<Post[]> {
  if (!db) {
    return SEED_POSTS.map((p) => ({
      id: p.id,
      author: p.author,
      authorUid: 'seed',
      initials: p.initials,
      color: p.color,
      body: p.body,
      tags: p.tags,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      likedByMe: false,
      createdAt: p.createdAt,
    }));
  }
  await seedPostsIfEmpty();
  const snap = await getDocs(collection(db, POSTS));
  const list = snap.docs.map((d) => {
    const data = d.data();
    const likedBy = (data.likedBy as string[]) ?? [];
    return {
      id: d.id,
      author: (data.author as string) ?? 'Usuario VARIUS',
      authorUid: (data.authorUid as string) ?? 'seed',
      initials: (data.initials as string) ?? '?',
      color: (data.color as string) ?? '#ccc',
      body: (data.body as string) ?? '',
      tags: (data.tags as string[]) ?? [],
      likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
      commentCount: typeof data.commentCount === 'number' ? data.commentCount : 0,
      likedByMe: !!uid && likedBy.includes(uid),
      createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    };
  });
  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

export async function createPost(uid: string, author: string, body: string, tags: string[]): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  const initials =
    author
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  const color = POST_COLORS[Math.floor(Math.random() * POST_COLORS.length)];
  await addDoc(collection(db, POSTS), {
    author,
    authorUid: uid,
    initials,
    color,
    body,
    tags,
    likeCount: 0,
    likedBy: [],
    commentCount: 0,
    createdAt: Date.now(),
  });
}

export async function toggleLike(postId: string, uid: string, likedByMe: boolean): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  const ref = doc(db, POSTS, postId);
  await updateDoc(ref, {
    likedBy: likedByMe ? arrayRemove(uid) : arrayUnion(uid),
    likeCount: increment(likedByMe ? -1 : 1),
  });
}

export async function fetchComments(postId: string): Promise<PostComment[]> {
  if (!db) return [];
  const q = query(collection(db, COMMENTS), where('postId', '==', postId), limit(50));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      author: (data.author as string) ?? 'Usuario',
      body: (data.body as string) ?? '',
      createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    };
  });
  list.sort((a, b) => a.createdAt - b.createdAt);
  return list;
}

export async function addComment(postId: string, author: string, body: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado');
  await addDoc(collection(db, COMMENTS), { postId, author, body, createdAt: Date.now() });
  await updateDoc(doc(db, POSTS, postId), { commentCount: increment(1) });
}
