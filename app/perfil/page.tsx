'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, CalendarDays, Camera, Check, FileText, GraduationCap, History, LogOut, Pencil, ShieldCheck, Upload, X } from 'lucide-react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth-context';
import { useMisSolicitudes } from '@/app/hooks/useMisSolicitudes';
import { ProfileFields, UserRole, updateProfileFields, fetchUserProfile, UserProfile } from '@/lib/firebase/profile';
import { HistoryItem, fetchHistory } from '@/lib/firebase/notifications';
import { fetchConsultations } from '@/lib/firebase/consultations';
import { uploadCover, uploadAvatar, uploadCertificate, uploadCV } from '@/lib/firebase/uploads';
import { AsesoriaRequest, createConversacion, fetchLawyerRequests, updateRequestStatus } from '@/lib/firebase/asesorias';
import { updateLawyerPrice, updateLawyerCity } from '@/lib/firebase/marketplace';
import Skeleton from '@/app/components/Skeleton';
import CitySelect from '@/app/components/CitySelect';
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
  const { user, role, loading, reloadRole, signOut } = useAuth();
  const { requests, reservas, loading: reqLoading } = useMisSolicitudes(user?.uid);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [consultasCount, setConsultasCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('citizen');
  const [editUniversity, setEditUniversity] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [verification, setVerification] = useState<LawyerVerification | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyForm, setVerifyForm] = useState({
    registryNumber: '',
    university: '',
    yearsExperience: '',
    bio: '',
    price: '',
    cedula: '',
  });
  const [verifySaving, setVerifySaving] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyPdf, setVerifyPdf] = useState<File | null>(null);
  const [verifyPdfUploading, setVerifyPdfUploading] = useState(false);
  const [verifyCv, setVerifyCv] = useState<File | null>(null);
  const [lawyerRequests, setLawyerRequests] = useState<AsesoriaRequest[]>([]);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [lawyerPrice, setLawyerPrice] = useState('');
  const [lawyerPriceLoading, setLawyerPriceLoading] = useState(false);
  const [lawyerPriceSaving, setLawyerPriceSaving] = useState(false);
  const [lawyerPriceError, setLawyerPriceError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!user) { setHistory([]); setHistoryLoading(false); return; }
    let active = true;
    fetchHistory(user.uid).then((l) => { if (active) setHistory(l); }).catch(() => {}).finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user) { setConsultasCount(0); return; }
    let active = true;
    fetchConsultations(user.uid).then((l) => { if (active) setConsultasCount(l.length); }).catch(() => {});
    return () => { active = false; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user) { setVerification(null); setVerificationLoading(false); return; }
    let active = true;
    setVerificationLoading(true);
    fetchLawyerVerification(user.uid).then((v) => { if (active) setVerification(v); }).catch(() => {}).finally(() => { if (active) setVerificationLoading(false); });
    return () => { active = false; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let active = true;
    fetchUserProfile(user.uid).then((p) => { if (active) setProfile(p); }).catch(() => {});
    return () => { active = false; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user || role !== 'lawyer' || !db) { setLawyerPrice(''); return; }
    let active = true;
    setLawyerPriceLoading(true);
    getDoc(doc(db, 'lawyers', user.uid))
      .then((snap) => {
        if (active && snap.exists()) setLawyerPrice((snap.data() as Record<string, string>).price ?? '');
      })
      .catch(() => {})
      .finally(() => { if (active) setLawyerPriceLoading(false); });
    return () => { active = false; };
  }, [user?.uid, role]);

  const handleRequestStatus = async (req: AsesoriaRequest, status: 'aceptada' | 'rechazada') => {
    if (!user) return;
    try {
      await updateRequestStatus(req.id, status);
      if (status === 'aceptada') {
        const conversacionId = await createConversacion({
          clientId: req.clientId,
          clientName: req.clientName,
          lawyerId: user.uid,
          lawyerName: user.displayName || 'Abogado VARIUS',
          requestId: req.id,
        });
        router.push(`/mensajes?conversacion=${conversacionId}`);
        return;
      }
      setLawyerRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status } : r));
    } catch {}
  };

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
          <p className="lead">Necesitas una cuenta para ver tu perfil. Usa el botón de perfil en la esquina superior derecha para iniciar sesión o registrarte.</p>
        </div>
      </section>
    );
  }

  const initials = user.displayName?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || '?';
  const coverUrl = profile?.coverURL;
  const avatarUrl = profile?.photoURL;

  const startEditing = () => {
    setEditName(user.displayName || '');
    setEditRole((role ?? 'citizen') as UserRole);
    setEditUniversity(profile?.university ?? '');
    setEditCareer(profile?.career ?? '');
    setEditCity(profile?.city ?? '');
    setEditBio(profile?.bio ?? '');
    setEditError('');
    setEditing(true);
  };

  const saveEdits = async () => {
    setSaving(true); setEditError('');
    try {
      const fields: ProfileFields = {};
      if (editName.trim() && editName.trim() !== user.displayName) {
        fields.displayName = editName.trim();
        await updateAuthProfile(user, { displayName: editName.trim() });
      }
      if (editRole !== role) fields.role = editRole;
      if (editRole === 'student') { fields.university = editUniversity.trim(); fields.career = editCareer.trim(); }
      const newCity = editCity.trim();
      const prevCity = (profile?.city ?? '').trim();
      if (newCity !== prevCity) fields.city = newCity;
      if (editBio !== (profile?.bio ?? '')) fields.bio = editBio.trim();
      await updateProfileFields(user.uid, fields);
      if (newCity !== prevCity && role === 'lawyer') {
        await updateLawyerCity(user.uid, newCity);
      }
      await reloadRole();
      setProfile((p) => p ? { ...p, ...fields } : p);
      setEditing(false);
    } catch { setEditError('No se pudieron guardar los cambios. Inténtalo de nuevo.'); }
    finally { setSaving(false); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadCover(user.uid, file, (p) => {});
      await updateProfileFields(user.uid, { coverURL: url });
      setProfile((p) => p ? { ...p, coverURL: url } : p);
    } catch { setEditError('No se pudo subir la portada.'); }
    finally { setCoverUploading(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(user.uid, file, (p) => {});
      await updateProfileFields(user.uid, { photoURL: url });
      await updateAuthProfile(user, { photoURL: url });
      setProfile((p) => p ? { ...p, photoURL: url } : p);
    } catch { setEditError('No se pudo subir el avatar.'); }
    finally { setAvatarUploading(false); }
  };

  const openVerify = () => {
    setVerifyMsg(''); setVerifyError('');
    setVerifyForm((prev) => ({
      ...prev,
      registryNumber: verification?.registryNumber ?? '',
      university: verification?.university ?? '',
      yearsExperience: verification?.yearsExperience ?? '',
      bio: verification?.bio ?? '',
      price: verification?.price ?? '',
      cedula: verification && 'cedula' in verification ? (verification as any).cedula : '',
    }));
    setVerifyPdf(null);
    setVerifyOpen(true);
  };

  const submitVerify = async () => {
    setVerifySaving(true); setVerifyError('');
    try {
      let pdfUrl = '';
      if (verifyPdf) {
        setVerifyPdfUploading(true);
        pdfUrl = await uploadCertificate(user.uid, verifyPdf, (p) => {});
        setVerifyPdfUploading(false);
      }
      let cvUrl = '';
      if (verifyCv) {
        cvUrl = await uploadCV(user.uid, verifyCv, (p) => {});
      }
      await submitLawyerVerification(user.uid, user.email ?? '', {
        fullName: user.displayName ?? '',
        registryNumber: verifyForm.registryNumber,
        university: verifyForm.university,
        yearsExperience: verifyForm.yearsExperience,
        bio: verifyForm.bio,
        price: verifyForm.price,
        cedula: verifyForm.cedula,
        certificadoURL: pdfUrl,
        cvURL: cvUrl,
      });
      setVerification({
        uid: user.uid, fullName: user.displayName ?? '', email: user.email ?? '',
        registryNumber: verifyForm.registryNumber, university: verifyForm.university,
        yearsExperience: verifyForm.yearsExperience, bio: verifyForm.bio, price: verifyForm.price,
        cedula: verifyForm.cedula, certificadoURL: pdfUrl, cvURL: cvUrl,
        status: 'pendiente', createdAt: Date.now(), updatedAt: Date.now(),
      });
      setVerifyMsg('Solicitud enviada. Te notificaremos cuando un administrador la revise.');
    } catch (e) { console.error('submitVerify:', e); setVerifyError('No se pudo enviar la solicitud. Inténtalo de nuevo.'); }
    finally { setVerifySaving(false); setVerifyPdfUploading(false); }
  };

  const saveLawyerPrice = async () => {
    if (!user || !lawyerPrice.trim()) return;
    setLawyerPriceSaving(true); setLawyerPriceError('');
    try {
      await updateLawyerPrice(user.uid, lawyerPrice.trim());
      setVerifyForm((f) => ({ ...f, price: lawyerPrice.trim() }));
      if (verification) setVerification((v) => v ? { ...v, price: lawyerPrice.trim() } : v);
    } catch { setLawyerPriceError('No se pudo guardar el precio.'); }
    finally { setLawyerPriceSaving(false); }
  };

  const canSubmitVerification = !verification || verification.status === 'rechazada';
  const verifyFormValid = verifyForm.registryNumber.trim() && verifyForm.university.trim() && verifyForm.yearsExperience.trim() && verifyForm.cedula.trim() && verifyPdf;

  return (
    <section className="profile-page">
      <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>

      {coverUrl && (
        <div style={{ width: '100%', height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 16, position: 'relative', background: '#f5f0f1' }}>
          <img src={coverUrl} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <label style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Camera size={14} /> Cambiar
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} disabled={coverUploading} />
          </label>
          {coverUploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12 }}>Subiendo…</div>}
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar" style={{ position: 'relative' }}>
          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
          <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#6b6566', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Camera size={12} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={avatarUploading} />
          </label>
          {avatarUploading && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.3)', display: 'grid', placeItems: 'center', fontSize: 9, color: '#fff' }}>...</div>}
        </div>
        <div className="profile-info">
          <h1>{user.displayName || 'Usuario VARIUS'}</h1>
          <p>{user.email}</p>
          {profile?.city && <p style={{ fontSize: 12, color: '#888' }}>📍 {profile.city}</p>}
          {role ? <span className={`role-badge ${role}`}>{roleLabels[role] || role}</span> : <span className="role-badge citizen">Sin rol asignado</span>}
        </div>
      </div>

      <div className="profile-activity">
        <div><b>{consultasCount}</b><span>Consultas IA</span></div>
        <div><b>{requests.length}</b><span>Asesorías</span></div>
        <div><b>{reservas.length}</b><span>Tutorías</span></div>
      </div>

      <div className="profile-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Información personal</h2>
          {!editing && <button className="chip" onClick={startEditing}><Pencil size={13} /> Editar</button>}
        </div>
        {coverUrl ? null : (
          <label style={{ display: 'block', marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ border: '1px dashed var(--line)', borderRadius: 12, padding: 20, textAlign: 'center', fontSize: 12, color: '#999' }}>
              <Camera size={18} style={{ marginBottom: 4 }} /><br />
              {coverUploading ? 'Subiendo portada…' : 'Agregar foto de portada'}
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} disabled={coverUploading} />
          </label>
        )}
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
              Nombre
              <input className="input-field" style={{ marginTop: 4 }} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Tu nombre completo" />
            </label>
            <CitySelect value={editCity} onChange={setEditCity} placeholder="Busca y selecciona tu ciudad" label="Ciudad" />
            <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
              Biografía
              <textarea className="input-field" style={{ marginTop: 4, minHeight: 60, resize: 'vertical' }} value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Cuéntanos sobre ti (opcional)" />
            </label>
            <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
              Rol en la plataforma
              <select className="input-field" style={{ marginTop: 4 }} value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)}>
                <option value="citizen">Ciudadano</option>
                <option value="student">Estudiante</option>
              </select>
            </label>
            {role !== 'lawyer' && role !== 'admin' && (
              <button
                type="button"
                className="chip"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  setEditing(false);
                  setVerifyMsg(''); setVerifyError('');
                  setVerifyOpen(true);
                }}
              >
                <Award size={13} /> Solicitar ser abogado
              </button>
            )}
            {editRole === 'student' && (
              <>
                <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Universidad
                  <input className="input-field" style={{ marginTop: 4 }} value={editUniversity} onChange={(e) => setEditUniversity(e.target.value)} placeholder="Ej. Universidad Central del Ecuador" />
                </label>
                <label style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Carrera
                  <input className="input-field" style={{ marginTop: 4 }} value={editCareer} onChange={(e) => setEditCareer(e.target.value)} placeholder="Ej. Derecho" />
                </label>
              </>
            )}
            {editRole === 'lawyer' && role !== 'lawyer' && (
              <p style={{ fontSize: 11, color: '#8c1044', background: '#fdf1f6', borderRadius: 8, padding: '10px 12px', margin: 0 }}>
                Para registrarte como abogado enviarás una solicitud de verificación. Tu rol actual no cambia hasta que un administrador la apruebe.
              </p>
            )}
            <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>El correo de tu cuenta no se puede modificar.</p>
            {editError && <p style={{ fontSize: 12, color: '#b00020' }}>{editError}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="landing-btn primary compact" disabled={saving || !editName.trim()} onClick={saveEdits}><span>{saving ? 'Guardando…' : 'Guardar cambios'}</span></button>
              <button className="landing-btn secondary compact" disabled={saving} onClick={() => setEditing(false)}><span>Cancelar</span></button>
            </div>
          </div>
        ) : (
          <>
            <dl className="profile-detail"><dt>Nombre</dt><dd>{user.displayName || '—'}</dd></dl>
            <dl className="profile-detail"><dt>Correo</dt><dd>{user.email || '—'}</dd></dl>
            {profile?.city && <dl className="profile-detail"><dt>Ciudad</dt><dd>{profile.city}</dd></dl>}
            {profile?.bio && <dl className="profile-detail"><dt>Biografía</dt><dd style={{ fontSize: 12, lineHeight: 1.5 }}>{profile.bio}</dd></dl>}
            <dl className="profile-detail"><dt>Rol</dt><dd>{role ? roleLabels[role] : 'No asignado'}</dd></dl>
            <dl className="profile-detail"><dt>Método de acceso</dt><dd>{user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email / Contraseña'}</dd></dl>
            <dl className="profile-detail"><dt>UID</dt><dd style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>{user.uid}</dd></dl>
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
                Cédula: {verification.cedula || '—'} · Registro: {verification.registryNumber || '—'} · {verification.yearsExperience || '—'} años
              </p>
              {verification.certificadoURL && (
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                  <a href={verification.certificadoURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wine)' }}>📄 Ver título subido</a>
                </p>
              )}
              {verification.cvURL && (
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>
                  <a href={verification.cvURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wine)' }}>📋 Ver hoja de vida</a>
                </p>
              )}
              {verification.status === 'rechazada' && (
                <button className="chip" style={{ marginTop: 10 }} onClick={openVerify}>Reenviar solicitud</button>
              )}
            </div>
          </div>
        </div>
      )}

      {role === 'lawyer' && (
        <div className="profile-section">
          <h2>Perfil profesional</h2>
          {profile?.cedula && <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Cédula: {profile.cedula}</p>}
          {profile?.bio && <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{profile.bio}</p>}
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: 12 }}>Actualiza el precio de tu consulta. Se reflejará en el marketplace.</p>
          <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
            Precio de consulta
            <input
              className="input-field"
              style={{ marginTop: 4 }}
              value={lawyerPrice}
              onChange={(e) => setLawyerPrice(e.target.value)}
              placeholder="Ej. $30 / consulta"
              disabled={lawyerPriceLoading}
            />
          </label>
          {lawyerPriceError && <p style={{ fontSize: 12, color: '#b00020', margin: '6px 0' }}>{lawyerPriceError}</p>}
          <button
            className="landing-btn primary compact"
            disabled={lawyerPriceSaving || !lawyerPrice.trim()}
            onClick={saveLawyerPrice}
          >
            <span>{lawyerPriceSaving ? 'Guardando…' : 'Guardar precio'}</span>
          </button>
        </div>
      )}

      {role === 'lawyer' && (
        <div className="profile-section">
          <h2>Solicitudes de asesoría recibidas</h2>
          {lawyerRequests.length === 0 ? (
            <p style={{ fontSize: 12, color: '#999' }}>No hay solicitudes pendientes. Cuando alguien te contacte desde el asistente IA o el marketplace, aparecerán aquí.</p>
          ) : (
            lawyerRequests.map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
                <FileText size={18} style={{ color: 'var(--wine)', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 13 }}>{r.clientName} busca asesoría</b>
                  {r.topic && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>Tema: {r.topic}</p>}
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aaa' }}>
                    {new Date(r.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })} · {r.status}
                  </p>
                  {r.status === 'pendiente' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="landing-btn primary compact" onClick={() => void handleRequestStatus(r, 'aceptada')}>
                        <Check size={14} /> Aceptar
                      </button>
                      <button className="landing-btn secondary compact" onClick={() => void handleRequestStatus(r, 'rechazada')}>
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {role === 'student' && !reqLoading && reservas.length > 0 && (
        <div className="profile-section">
          <h2>Mis tutorías reservadas</h2>
          {reservas.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
              <CalendarDays size={18} style={{ color: 'var(--wine)', marginTop: 2 }} />
              <div><b style={{ fontSize: 13 }}>{r.tutoriaTitle}</b><p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{r.fecha} a las {r.hora}</p></div>
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
              <div><b style={{ fontSize: 13 }}>Solicitud con {r.lawyerName}</b><p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>Pendiente de respuesta · {new Date(r.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}</p></div>
            </div>
          ))}
        </div>
      )}

      {role === 'student' && (
        <div className="profile-section">
          <h2>Tu progreso de aprendizaje</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <GraduationCap size={18} style={{ color: 'var(--wine)', marginTop: 2 }} />
            <p className="lead" style={{ margin: 0 }}>{reservas.length > 0 ? `${reservas.length} tutoría(s) reservada(s). ¡Sigue aprendiendo!` : 'Aún no has reservado tutorías. Explora Tutorías para reservar tu primera sesión.'}</p>
          </div>
        </div>
      )}

      <div className="profile-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><History size={18} style={{ color: 'var(--wine)' }} /> Historial de acciones</h2>
        <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 12px' }}>Registro permanente de tu actividad. Las notificaciones se pueden borrar, este historial no.</p>
        {historyLoading ? <p style={{ fontSize: 12, color: '#999' }}>Cargando historial…</p> : history.length === 0 ? <p style={{ fontSize: 12, color: '#999' }}>Todavía no hay actividad registrada.</p> : (
          history.map((h) => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px dashed var(--line)', fontSize: 13 }}>
              <span>{h.title}</span>
              <small style={{ color: '#aaa', whiteSpace: 'nowrap' }}>{new Date(h.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
            </div>
          ))
        )}
      </div>

      {role === 'admin' && (
        <Link href="/admin" style={{ textDecoration: 'none', marginBottom: 10, display: 'block' }}>
          <button className="profile-logout" style={{ border: '1px solid var(--line)', color: 'var(--ink)' }}>
            <ShieldCheck size={17} /> Panel de administración
          </button>
        </Link>
      )}
      <button className="profile-logout" onClick={() => setConfirmLogout(true)}><LogOut size={17} /> Cerrar sesión</button>

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
              <button className="landing-btn primary compact" onClick={async () => { await signOut(); }}>
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {verifyOpen && (
        <div className="dialog-bg" onClick={() => setVerifyOpen(false)}>
          <div className="lawyer-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setVerifyOpen(false)}><X size={18} /></button>
            <div className="lawyer-modal-body">
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>Verificación de abogado</h2>
              <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>Todos los campos son obligatorios. Debes subir tu título de abogado en PDF para que los usuarios puedan verificar tu identidad profesional.</p>
              {verification?.status === 'pendiente' && (
                <div className="verify-status"><b>Tu solicitud está en revisión.</b><p style={{ margin: '4px 0 0', fontSize: 12 }}>Te avisaremos cuando un administrador la apruebe o la rechace.</p></div>
              )}
              {canSubmitVerification && (
                <>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Número de cédula *<input className="input-field" style={{ marginTop: 4 }} value={verifyForm.cedula} onChange={(e) => setVerifyForm((f) => ({ ...f, cedula: e.target.value }))} placeholder="10 dígitos" />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Número de registro (Consejo de la Judicatura) *<input className="input-field" style={{ marginTop: 4 }} value={verifyForm.registryNumber} onChange={(e) => setVerifyForm((f) => ({ ...f, registryNumber: e.target.value }))} placeholder="Ej. 17-2020-123456" />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Universidad *<input className="input-field" style={{ marginTop: 4 }} value={verifyForm.university} onChange={(e) => setVerifyForm((f) => ({ ...f, university: e.target.value }))} placeholder="Universidad donde estudiaste" />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Años de experiencia *<input className="input-field" style={{ marginTop: 4 }} value={verifyForm.yearsExperience} onChange={(e) => setVerifyForm((f) => ({ ...f, yearsExperience: e.target.value }))} placeholder="Ej. 3" />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Bio profesional<textarea className="input-field" style={{ marginTop: 4, minHeight: 60, resize: 'vertical' }} value={verifyForm.bio} onChange={(e) => setVerifyForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Especialidades, enfoque de tu práctica…" />
                  </label>
                  <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    Precio referencial de consulta<input className="input-field" style={{ marginTop: 4 }} value={verifyForm.price} onChange={(e) => setVerifyForm((f) => ({ ...f, price: e.target.value }))} placeholder="Ej. $25" />
                  </label>
                  <div style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 12, border: '1px dashed var(--line)', borderRadius: 10 }}>
                      <Upload size={16} />
                      <span>{verifyPdf ? verifyPdf.name : 'Subir título de abogado (PDF) *'}</span>
                      <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setVerifyPdf(e.target.files?.[0] ?? null)} />
                    </label>
                    {verifyPdfUploading && <p style={{ fontSize: 11, color: '#999', margin: '4px 0' }}>Subiendo PDF…</p>}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: 12, border: '1px dashed var(--line)', borderRadius: 10 }}>
                      <Upload size={16} />
                      <span>{verifyCv ? verifyCv.name : 'Subir hoja de vida (PDF, opcional)'}</span>
                      <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setVerifyCv(e.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                </>
              )}
              {verifyMsg && <p style={{ fontSize: 13, color: '#5ba76a', margin: '10px 0 0' }}>{verifyMsg}</p>}
              {verifyError && <p style={{ fontSize: 13, color: '#b00020', margin: '10px 0 0' }}>{verifyError}</p>}
            </div>
            {canSubmitVerification && (
              <div className="lawyer-modal-footer">
                <button className="landing-btn primary compact" disabled={verifySaving || !verifyFormValid} onClick={submitVerify}><span>{verifySaving ? 'Enviando…' : 'Enviar solicitud'}</span></button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}