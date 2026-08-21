'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CalendarDays, FileText, GraduationCap, History, Pencil, X } from 'lucide-react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';
import { useMisSolicitudes } from '@/app/hooks/useMisSolicitudes';
import { ProfileFields, UserRole, updateProfileFields } from '@/lib/firebase/profile';
import { HistoryItem, fetchHistory } from '@/lib/firebase/notifications';
import Skeleton from '@/app/components/Skeleton';
import {
  LawyerVerification,
  fetchLawyerVerification,
  submitLawyerVerification,
} from '@/lib/firebase/verification';

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
  const [editUniversity, setEditUniversity] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [verification, setVerification] = useState<LawyerVerification | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    registryNumber: '',
    university: '',
    yearsExperience: '',
    bio: '',
    price: '',
  });
  const [verifySaving, setVerifySaving] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

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

  useEffect(() => {
    if (!user) {
      setVerification(null);
      setVerificationLoading(false);
      return;
    }
    let active = true;
    setVerificationLoading(true);
    fetchLawyerVerification(user.uid)
      .then((v) => {
        if (active) setVerification(v);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setVerificationLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.uid]);

  if (loading || verificationLoading) {
    return (
      <section className="profile-page">
        <Skeleton width={120} height={14} style={{ marginBottom: 28 }} />
        <div className="profile-header">
          <Skeleton width={80} height={80} radius="50%" />
          <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={180} height={20} />
            <Skeleton width={220} height={12} />
            <Skeleton width={90} height={22} radius={999} />
          </div>
        </div>
        <div className="profile-section">
          <Skeleton width={160} height={16} style={{ marginBottom: 14 }} />
          <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="45%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={12} />
        </div>
        <div className="profile-section">
          <Skeleton width={160} height={16} style={{ marginBottom: 14 }} />
          <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="55%" height={12} />
        </div>
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
    setEditUniversity('');
    setEditCareer('');
    setEditError('');
    setEditing(true);
  };

  const saveEdits = async () => {
    setSaving(true);
    setEditError('');
    try {
      if (editRole === 'lawyer' && role !== 'lawyer') {
        setEditing(false);
        setVerifyMsg('');
        setVerifyError('');
        setVerifyOpen(true);
        return;
      }
      const fields: ProfileFields = {};
      if (editName.trim() && editName.trim() !== user.displayName) {
        fields.displayName = editName.trim();
        await updateAuthProfile(user, { displayName: editName.trim() });
      }
      if (editRole !== role) fields.role = editRole;
      if (editRole === 'student') {
        fields.university = editUniversity.trim();
        fields.career = editCareer.trim();
      }
      await updateProfileFields(user.uid, fields);
      await reloadRole();
      setEditing(false);
    } catch {
      setEditError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const openVerify = () => {
    setVerifyMsg('');
    setVerifyError('');
    setVerifyForm((prev) => ({
      ...prev,
      registryNumber: verification?.registryNumber ?? '',
      university: verification?.university ?? '',
      yearsExperience: verification?.yearsExperience ?? '',
      bio: verification?.bio ?? '',
      price: verification?.price ?? '',
    }));
    setVerifyOpen(true);
  };

  const submitVerify = async () => {
    setVerifySaving(true);
    setVerifyError('');
    try {
      await submitLawyerVerification(user.uid, user.email ?? '', {
        fullName: user.displayName ?? '',
        registryNumber: verifyForm.registryNumber,
        university: verifyForm.university,
        yearsExperience: verifyForm.yearsExperience,
        bio: verifyForm.bio,
        price: verifyForm.price,
      });
      setVerification({
        uid: user.uid,
        fullName: user.displayName ?? '',
        email: user.email ?? '',
        registryNumber: verifyForm.registryNumber,
        university: verifyForm.university,
        yearsExperience: verifyForm.yearsExperience,
        bio: verifyForm.bio,
        price: verifyForm.price,
        status: 'pendiente',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setVerifyMsg('Solicitud enviada. Te notificaremos cuando un administrador la revise.');
    } catch {
      setVerifyError('No se pudo enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setVerifySaving(false);
    }
  };

  const canSubmitVerification = !verification || verification.status === 'rechazada';
  const verifyFormValid =
    verifyForm.registryNumber.trim() &&
    verifyForm.university.trim() &&
    verifyForm.yearsExperience.trim();

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
            <button className="chip" onClick={startEditing}>
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

            {editRole === 'student' && (
              <>
                <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
                  Universidad
                  <input
                    className="input-field"
                    style={{ marginTop: 4 }}
                    value={editUniversity}
                    onChange={(e) => setEditUniversity(e.target.value)}
                    placeholder="Ej. Universidad Central del Ecuador"
                  />
                </label>
                <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
                  Carrera
                  <input
                    className="input-field"
                    style={{ marginTop: 4 }}
                    value={editCareer}
                    onChange={(e) => setEditCareer(e.target.value)}
                    placeholder="Ej. Derecho"
                  />
                </label>
              </>
            )}

            {editRole === 'lawyer' && role !== 'lawyer' && (
              <p style={{ fontSize: 11, color: '#8c1044', background: '#fdf1f6', borderRadius: 8, padding: '10px 12px', margin: 0 }}>
                Para registrarte como abogado enviarás una solicitud de verificación con tus datos
                profesionales. Tu rol actual no cambia hasta que un administrador la apruebe.
              </p>
            )}

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

      {verification && verification.status !== 'aprobada' && (
        <div className="profile-section">
          <h2>Solicitud de verificación de abogado</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0' }}>
            <Award size={18} style={{ color: 'var(--wine)', marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                {verification.status === 'pendiente' && 'Tu solicitud está en revisión.'}
                {verification.status === 'rechazada' && 'Tu solicitud fue rechazada. Vuelve a enviarla con datos corregidos.'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
                Registro: {verification.registryNumber || '—'} · {verification.university || '—'} ·{' '}
                {verification.yearsExperience || '—'} años de experiencia
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
                {verification.status === 'pendiente'
                  ? 'Un administrador revisará tu información. Te avisaremos cuando cambie tu estado.'
                  : verification.status === 'rechazada'
                    ? 'Corrige tus datos y envía la solicitud nuevamente.'
                    : ''}
              </p>
              {verification.status === 'rechazada' && (
                <button className="chip" style={{ marginTop: 10 }} onClick={openVerify}>
                  Reenviar solicitud
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

      {verifyOpen && (
        <div className="dialog-bg" onClick={() => setVerifyOpen(false)}>
          <div className="lawyer-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setVerifyOpen(false)}>
              <X size={18} />
            </button>
            <div className="lawyer-modal-body">
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>Verificación de abogado</h2>
              <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
                Completa tus datos profesionales. Un administrador revisará la solicitud y tu rol
                cambiará a Abogado cuando sea aprobada.
              </p>

              {verification?.status === 'pendiente' && (
                <div className="verify-status">
                  <b>Tu solicitud está en revisión.</b>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                    Te avisaremos cuando un administrador la apruebe o la rechace.
                  </p>
                </div>
              )}

              {canSubmitVerification && (
                <>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Número de registro (Consejo de la Judicatura)
                    <input
                      className="input-field"
                      style={{ marginTop: 4 }}
                      value={verifyForm.registryNumber}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, registryNumber: e.target.value }))}
                      placeholder="Ej. 17-2020-123456"
                    />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Universidad
                    <input
                      className="input-field"
                      style={{ marginTop: 4 }}
                      value={verifyForm.university}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, university: e.target.value }))}
                      placeholder="Universidad donde estudiaste"
                    />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Años de experiencia
                    <input
                      className="input-field"
                      style={{ marginTop: 4 }}
                      value={verifyForm.yearsExperience}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, yearsExperience: e.target.value }))}
                      placeholder="Ej. 3"
                    />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Bio profesional
                    <textarea
                      className="input-field"
                      style={{ marginTop: 4, minHeight: 70, resize: 'vertical' }}
                      value={verifyForm.bio}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, bio: e.target.value }))}
                      placeholder="Especialidades, enfoque de tu práctica…"
                    />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Precio referencial de consulta
                    <input
                      className="input-field"
                      style={{ marginTop: 4 }}
                      value={verifyForm.price}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="Ej. $25"
                    />
                  </label>
                </>
              )}

              {verifyMsg && (
                <p style={{ fontSize: 13, color: '#5ba76a', margin: '10px 0 0' }}>{verifyMsg}</p>
              )}
              {verifyError && (
                <p style={{ fontSize: 13, color: '#b00020', margin: '10px 0 0' }}>{verifyError}</p>
              )}
            </div>

            {canSubmitVerification && (
              <div className="lawyer-modal-footer">
                <button
                  className="landing-btn primary compact"
                  disabled={verifySaving || !verifyFormValid}
                  onClick={submitVerify}
                >
                  <span>{verifySaving ? 'Enviando…' : 'Enviar solicitud'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
