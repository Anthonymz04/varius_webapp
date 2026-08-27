'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { Bot, Briefcase, Eye, EyeOff, GraduationCap, X } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';
import { UserRole, createProfile } from '@/lib/firebase/profile';
import { SocialLogin } from '@capgo/capacitor-social-login';

const WEB_CLIENT_ID = '574882045841-ranm5dmmrbrme1a8dn6ll7hvq2kp34aj.apps.googleusercontent.com';

function isNative(): boolean {
  return typeof window !== 'undefined' && !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
}

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

  const google = async () => {
    if (!auth) return setError('Firebase no está disponible.');
    setBusy(true);
    setError('');
    try {
      let resultUser: User;
      if (isNative()) {
        await SocialLogin.initialize({ google: { webClientId: WEB_CLIENT_ID } });
        const { result } = await SocialLogin.login({ provider: 'google', options: {} });
        const idToken = (result as { idToken?: string | null }).idToken;
        if (!idToken) {
          throw new Error('No se obtuvo el token de Google.');
        }
        resultUser = (await signInWithCredential(auth, GoogleAuthProvider.credential(idToken))).user;
      } else {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        resultUser = result.user;
      }
      let hasRole = false;
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'users', resultUser.uid));
          hasRole = snap.exists() && Boolean(snap.data().role);
        } catch {
          hasRole = false;
        }
      }
      if (hasRole) {
        close();
      } else {
        setPendingUser(resultUser);
        setStep('role');
      }
    } catch {
      setError(
        'No se pudo iniciar sesión con Google. Verifica que el proveedor esté habilitado en Firebase.'
      );
    } finally {
      setBusy(false);
    }
  };

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
            const native = typeof window !== 'undefined' && !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
            setError(
              native
                ? 'Esta cuenta se creó con Google. En la app móvil usa una cuenta local con correo y contraseña; el login con Google funciona en la versión web.'
                : 'Esta cuenta se creó con Google. Usa el botón "Continuar con Google" para iniciar sesión.'
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

  // Step 2: choose role after first Google login
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
