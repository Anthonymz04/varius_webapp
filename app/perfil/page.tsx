'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, FileText, GraduationCap, History, Pencil } from 'lucide-react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';
import { useMisSolicitudes } from '@/app/hooks/useMisSolicitudes';
import { UserRole, updateProfileFields } from '@/lib/firebase/profile';
import { HistoryItem, fetchHistory } from '@/lib/firebase/notifications';

const roleLabels: Record<string, string> = {
  citizen: 'Ciudadano',
  student: 'Estudiante',
  lawyer: 'Abogado',
};

export default function PerfilPage() {
  const { user, role, loading, reloadRole } = useAuth();
  const { requests, reservas, loading: reqLoading } = useMisSolicitudes(user?.uid);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('citizen');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setHistoryLoading(false);
      return;
    }
    let active = true;
    fetchHistory(user.uid)
      .then((list) => {
        if (active) setHistory(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.uid]);

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

  const startEditing = () => {
    setEditName(user.displayName || '');
    setEditRole((role ?? 'citizen') as UserRole);
    setEditError('');
    setEditing(true);
  };

  const saveEdits = async () => {
    setSaving(true);
    setEditError('');
    try {
      const fields: { displayName?: string; role?: UserRole } = {};
      if (editName.trim() && editName.trim() !== user.displayName) {
        fields.displayName = editName.trim();
        await updateAuthProfile(user, { displayName: editName.trim() });
      }
      if (editRole !== role) fields.role = editRole;
      await updateProfileFields(user.uid, fields);
      await reloadRole();
      setEditing(false);
    } catch {
      setEditError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <Link href="/" className="back">← Volver al inicio</Link>

      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1>{user.displayName || 'Usuario VARIUS'}</h1>
          <p>{user.email}</p>
          {role ? (
            <span className={`role-badge ${role}`}>{roleLabels[role] || role}</span>
          ) : (
            <span className="role-badge citizen">Sin rol asignado</span>
          )}
        </div>
      </div>

      <div className="profile-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Información personal</h2>
          {!editing && (
            <button
              className="chip"
              onClick={startEditing}
            >
              <Pencil size={13} /> Editar
            </button>
          )}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
              Nombre
              <input
                className="input-field"
                style={{ marginTop: 4 }}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </label>
            <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
              Rol en la plataforma
              <select
                className="input-field"
                style={{ marginTop: 4 }}
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
              >
                <option value="citizen">Ciudadano</option>
                <option value="student">Estudiante</option>
                <option value="lawyer">Abogado</option>
              </select>
            </label>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
              El correo de tu cuenta no se puede modificar. Cambiar el rol actualiza tu dashboard personalizado.
            </p>
            {editError && <p style={{ fontSize: 12, color: '#b00020' }}>{editError}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="landing-btn primary compact" disabled={saving || !editName.trim()} onClick={saveEdits}>
                <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
              </button>
              <button className="landing-btn secondary compact" disabled={saving} onClick={() => setEditing(false)}>
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
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

      <div className="profile-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} style={{ color: 'var(--wine)' }} /> Historial de acciones
        </h2>
        <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 12px' }}>
          Registro permanente de tu actividad. Las notificaciones se pueden borrar, este historial no.
        </p>
        {historyLoading ? (
          <p style={{ fontSize: 12, color: '#999' }}>Cargando historial…</p>
        ) : history.length === 0 ? (
          <p style={{ fontSize: 12, color: '#999' }}>Todavía no hay actividad registrada.</p>
        ) : (
          history.map((h) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px dashed var(--line)', fontSize: 13 }}>
              <span>{h.title}</span>
              <small style={{ color: '#aaa', whiteSpace: 'nowrap' }}>
                {new Date(h.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
              </small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
