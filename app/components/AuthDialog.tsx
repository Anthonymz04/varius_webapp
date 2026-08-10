'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { X } from 'lucide-react';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { UserRole, createProfile } from '@/lib/firebase/profile';

interface AuthDialogProps {
  user: User | null;
  close: () => void;
}

export default function AuthDialog({ user, close }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const ensureProfile = async (activeUser: User) =>
    createProfile({
      uid: activeUser.uid,
      name: activeUser.displayName || name || 'Usuario VARIUS',
      email: activeUser.email || email,
      photoURL: activeUser.photoURL,
      role,
    });

  const google = async () => {
    if (!auth) return setError('Firebase no está disponible.');
    setBusy(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureProfile(result.user);
      close();
    } catch {
      setError(
        'No se pudo iniciar sesión con Google. Verifica que el proveedor esté habilitado en Firebase.'
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) return setError('Firebase no está disponible.');
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await ensureProfile(result.user);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      close();
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      setError(
        code === 'auth/email-already-in-use'
          ? 'Este correo ya está registrado.'
          : code === 'auth/weak-password'
            ? 'Usa al menos 6 caracteres en la contraseña.'
            : 'No fue posible autenticarte. Revisa tu correo y contraseña.'
      );
    } finally {
      setBusy(false);
    }
  };

  // User is logged in — show account info
  if (user) {
    return (
      <div className="auth-overlay" role="dialog" aria-modal="true">
        <section className="auth-modal">
          <button className="close" onClick={close}>
            <X size={19} />
          </button>
          <span className="auth-mark">V</span>
          <h2>Tu cuenta</h2>
          <p className="auth-copy">
            Has iniciado sesión como <b>{user.email}</b>.
          </p>
          <button
            className="primary"
            onClick={async () => {
              if (auth) await auth.signOut();
              close();
            }}
          >
            Cerrar sesión
          </button>
        </section>
      </div>
    );
  }

  // Login / Register form
  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <section className="auth-modal">
        <button className="close" onClick={close}>
          <X size={19} />
        </button>
        <span className="auth-mark">V</span>
        <h2>{mode === 'login' ? 'Bienvenido a VARIUS' : 'Crea tu cuenta'}</h2>
        <p className="auth-copy">
          {mode === 'login'
            ? 'Ingresa para continuar tu camino jurídico.'
            : 'Elige cómo quieres vivir VARIUS.'}
        </p>

        {!isFirebaseConfigured && (
          <p className="auth-error">Firebase no está configurado en este entorno.</p>
        )}

        <button
          className="google"
          onClick={google}
          disabled={busy || !isFirebaseConfigured}
        >
          Continuar con Google
        </button>

        <div className="or">o con tu correo</div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input
                required
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="citizen">Ciudadano</option>
                <option value="student">Estudiante</option>
                <option value="lawyer">Abogado</option>
              </select>
            </>
          )}
          <input
            required
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            minLength={6}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="auth-error">{error}</p>}
          <button
            className="primary"
            disabled={busy || !isFirebaseConfigured}
          >
            {busy
              ? 'Procesando…'
              : mode === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
          </button>
        </form>

        <button
          className="switch"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login'
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </section>
    </div>
  );
}
