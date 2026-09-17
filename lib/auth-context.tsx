'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { UserRole } from '@/lib/firebase/profile';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  reloadRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  reloadRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true });

  useEffect(() => {
    if (!auth) {
      setState({ user: null, role: null, loading: false });
      return;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      // Fetch role from Firestore
      let role: UserRole | null = null;
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            role = (snap.data().role as UserRole) ?? null;
          } else {
            // Safety net: the sign-up flow may still be writing the chosen role.
            await new Promise((r) => setTimeout(r, 1500));
            const recheck = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (recheck.exists()) {
              role = (recheck.data().role as UserRole) ?? null;
            } else {
              role = 'citizen';
              await setDoc(
                doc(db, 'users', firebaseUser.uid),
                {
                  displayName: firebaseUser.displayName || 'Usuario VARIUS',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL ?? null,
                  role: 'citizen',
                  updatedAt: serverTimestamp(),
                  createdAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          }
        } catch {
          // Firestore may not have the doc yet (first login before profile creation)
        }
      }

      setState({ user: firebaseUser, role, loading: false });
    });
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  const handleReloadRole = async () => {
    const current = auth?.currentUser;
    if (!current || !db) return;
    try {
      const snap = await getDoc(doc(db, 'users', current.uid));
      if (snap.exists()) {
        setState((prev) => ({ ...prev, role: (snap.data().role as UserRole) ?? prev.role }));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut: handleSignOut, reloadRole: handleReloadRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
