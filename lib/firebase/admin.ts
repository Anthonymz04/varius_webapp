'use client';

import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { addHistory, createNotification } from '@/lib/firebase/notifications';
import { LawyerVerification } from '@/lib/firebase/verification';

export async function fetchPendingVerifications(): Promise<LawyerVerification[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'lawyer_verifications'), where('status', '==', 'pendiente'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        fullName: (data.fullName as string) ?? '',
        email: (data.email as string) ?? '',
        registryNumber: (data.registryNumber as string) ?? '',
        university: (data.university as string) ?? '',
        yearsExperience: (data.yearsExperience as string) ?? '',
        bio: (data.bio as string) ?? '',
        price: (data.price as string) ?? '',
        cedula: (data.cedula as string) ?? '',
        certificadoURL: (data.certificadoURL as string) ?? '',
        cvURL: (data.cvURL as string) ?? '',
        status: (data.status as LawyerVerification['status']) ?? 'pendiente',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      };
    });
  } catch (e) { console.error('fetchPendingVerifications:', e); return []; }
}

export async function approveVerification(v: LawyerVerification, adminUid: string, adminName: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  const admin = await getDoc(doc(db, 'users', adminUid));
  const adminName_ = admin.exists() ? (admin.data().name as string) || adminName : adminName;
  await setDoc(doc(db, 'users', v.uid), {
    role: 'lawyer',
    nationalId: v.cedula,
    cedula: v.cedula,
    certificateURL: v.certificadoURL,
    cvURL: v.cvURL || null,
    updatedAt: Date.now(),
  }, { merge: true });

  await setDoc(doc(db, 'lawyers', v.uid), {
    uid: v.uid,
    name: v.fullName,
    role: 'Derecho',
    city: '',
    rating: 'Nuevo',
    reviews: '0 reseñas',
    price: v.price || '$30 / consulta',
    color: '#d8ad96',
    initials: (v.fullName.split(' ').map((x) => x[0]).join('').slice(0, 2) || '?').toUpperCase(),
    bio: v.bio || 'Abogado verificado por VARIUS.',
    education: v.university,
    experience: `${v.yearsExperience} años de experiencia`,
    cedula: v.cedula,
    certificadoURL: v.certificadoURL,
    cvURL: v.cvURL || null,
    verified: true,
    createdAt: Date.now(),
  });

  await updateDoc(doc(db, 'lawyer_verifications', v.uid), { status: 'aprobada', updatedAt: Date.now() });

  await Promise.all([
    createNotification(v.uid, v.uid, 'cuenta', 'Verificación aprobada', 'Tu perfil de abogado fue aprobado. Ya apareces en el marketplace.'),
    addHistory(v.uid, 'cuenta', 'Verificación de abogado aprobada'),
    addHistory(adminUid, 'cuenta', `Aprobó la verificación de ${v.fullName} (revisada por ${adminName_})`),
  ]);
}

export async function rejectVerification(uid: string, fullName: string, adminUid: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  await updateDoc(doc(db, 'lawyer_verifications', uid), { status: 'rechazada', updatedAt: Date.now() });
  await Promise.all([
    createNotification(uid, uid, 'cuenta', 'Verificación rechazada', 'Tu solicitud de verificación fue rechazada. Corrige tus datos y vuelve a enviarla.'),
    addHistory(uid, 'cuenta', 'Verificación de abogado rechazada'),
    addHistory(adminUid, 'cuenta', `Rechazó la verificación de ${fullName}`),
  ]);
}
