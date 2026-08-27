'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Bot, Briefcase, Eye, EyeOff, GraduationCap, X } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';
import { UserRole, createProfile } from '@/lib/firebase/profile';

interface AuthDialogProps {
  user: User | null;
  close: () => void;
}

type Step = 'form' | 'role';

const roleOptions: { value: UserRole; title: string; text: string; Icon: typeof Bot }[] = [
  { value: 'citizen', title: 'Ciudadano', text: 'Orientación jurídica y conexión con abogados.', Icon: Bot },
  { value: 'student', title: 'Estudiante', text: 'Tutorías, biblioteca y comunidad académica.', Icon: GraduationCap },
  { value: 'lawyer', title: 'Abogado', text: 'Ofrece tus servicios y gana visibilidad.', Icon: Briefcase },
];

export default function AuthDialog({ user, close }: AuthDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<Step>('form');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ensureProfile = async (activeUser: User, chosenRole: UserRole) =>
    createProfile({
      uid: activeUser.uid,
      name: activeUser.displayName || name || 'Usuario VARIUS',
      email: activeUser.email || email,
      photoURL: activeUser.photoURL,
      role: chosenRole,
    });

  const pickRole = async (chosen: UserRole) => {
    if (!pendingUser) return;
    setBusy(true);
    setError('');
    try {
      await ensureProfile(pendingUser, chosen);
      close();
    } catch {
      setError('No se pudo guardar tu perfil. Cierra sesión e inténtalo de nuevo.');
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
        await ensureProfile(result.user, role);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      close();
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      if (mode === 'login' && code && auth && email) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes('google.com') && !methods.includes('password')) {
            setError(
              'Esta cuenta se creó con Google, que ya no está disponible. Crea una cuenta nueva con correo y contraseña.'
            );
            return;
          }
        } catch {}
      }
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
            className="secondary-light"
            onClick={() => {
              close();
              router.push('/perfil');
            }}
            style={{ marginBottom: 10 }}
          >
            Ver y editar mi perfil
          </button>
          <button
            className="primary"
            onClick={async () => {
              if (auth) await auth.signOut();
              close();
              router.push('/');
            }}
          >
            Cerrar sesión
          </button>
        </section>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="auth-overlay" role="dialog" aria-modal="true">
        <section className="auth-modal">
          <button className="close" onClick={close}>
            <X size={19} />
          </button>
          <span className="auth-mark">V</span>
          <h2>¿Cómo quieres vivir VARIUS?</h2>
          <p className="auth-copy">
            Hola <b>{pendingUser?.displayName || 'nuevo usuario'}</b>. Elige tu perfil para
            personalizar tu experiencia. Puedes cambiarlo luego en tu perfil.
          </p>
          {error && <p className="auth-error">{error}</p>}
          <div className="role-picker">
            {roleOptions.map(({ value, title, text, Icon }) => (
              <button key={value} disabled={busy} onClick={() => pickRole(value)}>
                <Icon size={22} />
                <b>{title}</b>
                <span>{text}</span>
              </button>
            ))}
          </div>
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
          <div className="auth-password-wrap">
            <input
              required
              minLength={6}
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
