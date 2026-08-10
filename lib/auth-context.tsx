'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { UserRole } from '@/lib/firebase/profile';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
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

  return (
    <AuthContext.Provider value={{ ...state, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
