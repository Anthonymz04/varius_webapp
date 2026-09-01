'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Instagram,
  LogOut,
  Mail,
  MessageCircle,
  Music2,
  Settings,
  User,
  Users,
  X,
  Youtube,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthDialog from '@/app/components/AuthDialog';
import { useState } from 'react';

export default function ConfiguracionPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const initials = user?.displayName
    ?.split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const handleLogout = async () => {
    setConfirmLogout(false);
    await signOut();
    router.push('/');
  };

  const item = (href: string, icon: React.ReactNode, label: string, desc?: string) => (
    <Link href={href} className="cfg-item">
      <span className="cfg-icon">{icon}</span>
      <span className="cfg-text">
        <b>{label}</b>
        {desc && <small>{desc}</small>}
      </span>
    </Link>
  );

  return (
    <section className="cfg-page">
      <div className="cfg-head">
        <Link href="/" aria-label="Volver al inicio" className="back">
          <ArrowLeft size={18} />
        </Link>
        <h1>Configuración</h1>
      </div>

      <div className="cfg-profile">
        <span className="mn-avatar">{initials}</span>
        <span className="cfg-profile-text">
          <b>{user?.displayName || 'Mi perfil'}</b>
          <small>{user ? (user.email ?? 'Cuenta VARIUS') : 'Inicia sesión para continuar'}</small>
        </span>
      </div>

      <div className="mn-section">ACTIVIDAD</div>
      {item('/mensajes', <MessageCircle size={18} />, 'Asesorías activas', 'Chat 1:1 con tus abogados')}
      {item('/perfil', <Settings size={18} />, 'Editar mi perfil', 'Datos personales, ciudad y foto')}

      <div className="mn-section">VARIUS</div>
      {item('/nosotros', <BookOpen size={18} />, 'Misión y visión', 'Conoce el proyecto')}
      {item('/nosotros', <Mail size={18} />, 'Contáctanos', 'Escríbenos')}

      <div className="mn-section">AYUDA</div>
      {item('/preguntas-frecuentes', <HelpCircle size={18} />, 'Preguntas frecuentes', 'Dudas comunes')}
      {item('/asistente', <User size={18} />, 'Soporte con IA', 'Asistente jurídico')}

      <div className="mn-section">SÍGUENOS</div>
      <div className="mn-socials cfg-socials">
        <a href="https://instagram.com/varius_legal" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
        <a href="https://tiktok.com/@varius_legal" target="_blank" rel="noopener noreferrer"><Music2 size={18} /></a>
        <a href="https://youtube.com/@varius_legal" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
      </div>

      <div className="mn-sep" />
      {user ? (
        <button className="cfg-logout" onClick={() => setConfirmLogout(true)}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      ) : (
        <button className="cfg-logout" onClick={() => setAuthOpen(true)}>
          <Users size={16} /> Iniciar sesión
        </button>
      )}

      {authOpen && <AuthDialog user={user} close={() => setAuthOpen(false)} />}

      {confirmLogout && (
        <div className="dialog-bg" onClick={() => setConfirmLogout(false)}>
          <div className="lawyer-modal" style={{ maxWidth: 360, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setConfirmLogout(false)}><X size={18} /></button>
            <div className="lawyer-modal-body">
              <LogOut size={28} style={{ color: 'var(--wine)', margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>¿Cerrar sesión?</h2>
              <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                ¿Estás seguro de que quieres cerrar tu sesión en VARIUS? Podrás volver a iniciar sesión cuando quieras.
              </p>
            </div>
            <div className="lawyer-modal-footer" style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="landing-btn primary compact" onClick={handleLogout}>
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
