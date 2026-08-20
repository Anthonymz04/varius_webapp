'use client';

import Link from 'next/link';
import { CalendarDays, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useMisSolicitudes } from '@/app/hooks/useMisSolicitudes';

const roleLabels: Record<string, string> = {
  citizen: 'Ciudadano',
  student: 'Estudiante',
  lawyer: 'Abogado',
};

export default function PerfilPage() {
  const { user, role, loading } = useAuth();
  const { requests, reservas, loading: reqLoading } = useMisSolicitudes(user?.uid);

  if (loading) {
    return (
      <section className="profile-page">
        <p style={{ textAlign: 'center', color: '#999', padding: '60px 0' }}>
          Cargando perfil...
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-page">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h1 style={{ marginBottom: '12px' }}>Inicia sesión</h1>
          <p className="lead">
            Necesitas una cuenta para ver tu perfil. Usa el botón de perfil en la esquina
            superior derecha para iniciar sesión o registrarte.
          </p>
        </div>
      </section>
    );
  }

  const initials = user.displayName
    ?.split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <section className="profile-page">
      <Link href="/" className="back">← Volver al inicio</Link>

      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1>{user.displayName || 'Usuario VARIUS'}</h1>
          <p>{user.email}</p>
          {role && (
            <span className={`role-badge ${role}`}>
              {roleLabels[role] || role}
            </span>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>Información de cuenta</h2>
        <dl className="profile-detail">
          <dt>Nombre</dt>
          <dd>{user.displayName || '—'}</dd>
        </dl>
        <dl className="profile-detail">
          <dt>Correo</dt>
          <dd>{user.email || '—'}</dd>
        </dl>
        <dl className="profile-detail">
          <dt>Rol</dt>
          <dd>{role ? roleLabels[role] : 'No asignado'}</dd>
        </dl>
        <dl className="profile-detail">
          <dt>Método de acceso</dt>
          <dd>{user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email / Contraseña'}</dd>
        </dl>
        <dl className="profile-detail">
          <dt>UID</dt>
          <dd style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>{user.uid}</dd>
        </dl>
      </div>

      {role === 'lawyer' && (
        <div className="profile-section">
          <h2>Perfil profesional</h2>
          <p className="lead" style={{ marginBottom: '16px' }}>
            Tu perfil de abogado será visible en el marketplace para ciudadanos y estudiantes que busquen orientación legal.
          </p>
          <p style={{ fontSize: '12px', color: '#aaa' }}>
            La edición del perfil profesional estará disponible próximamente.
          </p>
        </div>
      )}

      {role === 'student' && !reqLoading && reservas.length > 0 && (
        <div className="profile-section">
          <h2>Mis tutorías reservadas</h2>
          {reservas.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
              <CalendarDays size={18} style={{ color: 'var(--wine)', marginTop: 2 }} />
              <div>
                <b style={{ fontSize: 13 }}>{r.tutoriaTitle}</b>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                  {r.fecha} a las {r.hora}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!reqLoading && requests.length > 0 && (
        <div className="profile-section">
          <h2>Mis solicitudes de asesoría</h2>
          {requests.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
              <FileText size={18} style={{ color: 'var(--wine)', marginTop: 2 }} />
              <div>
                <b style={{ fontSize: 13 }}>Solicitud con {r.lawyerName}</b>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                  Pendiente de respuesta · {new Date(r.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {role === 'student' && (
        <div className="profile-section">
          <h2>Tu progreso de aprendizaje</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <GraduationCap size={18} style={{ color: 'var(--wine)', marginTop: 2 }} />
            <p className="lead" style={{ margin: 0 }}>
              {reqLoading ? 'Cargando…' : reservas.length > 0 ? `${reservas.length} tutoría(s) reservada(s). ¡Sigue aprendiendo!` : 'Aún no has reservado tutorías. Explora Tutorías para reservar tu primera sesión.'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
