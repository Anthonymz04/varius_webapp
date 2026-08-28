'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Check, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LawyerVerification } from '@/lib/firebase/verification';
import { approveVerification, fetchPendingVerifications, rejectVerification } from '@/lib/firebase/admin';
import Skeleton from '@/app/components/Skeleton';

export default function AdminPage() {
  const { user, role, loading } = useAuth();
  const [items, setItems] = useState<LawyerVerification[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (role !== 'admin') return;
    let active = true;
    setLoadingItems(true);
    fetchPendingVerifications().then((l) => { if (active) setItems(l); }).catch(() => {}).finally(() => { if (active) setLoadingItems(false); });
    return () => { active = false; };
  }, [role]);

  if (loading) {
    return (
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '48px 20px' }}>
        <Skeleton width={200} height={20} style={{ marginBottom: 24 }} />
        <Skeleton width="100%" height={90} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={90} />
      </section>
    );
  }

  if (role !== 'admin') {
    return (
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <ShieldCheck size={40} style={{ color: 'var(--wine)', margin: '0 auto 14px' }} />
        <h1 style={{ marginBottom: 10 }}>Acceso restringido</h1>
        <p className="lead" style={{ margin: 0 }}>Esta página es solo para administradores de VARIUS.</p>
      </section>
    );
  }

  const handleApprove = async (v: LawyerVerification) => {
    setBusyId(v.uid); setMsg('');
    try {
      await approveVerification(v);
      setItems((prev) => prev.filter((x) => x.uid !== v.uid));
      setMsg(`${v.fullName} fue aprobado y ya aparece en el marketplace.`);
    } catch { setMsg('No se pudo completar la aprobación.'); }
    finally { setBusyId(null); }
  };

  const handleReject = async (v: LawyerVerification) => {
    setBusyId(v.uid); setMsg('');
    try {
      await rejectVerification(v.uid);
      setItems((prev) => prev.filter((x) => x.uid !== v.uid));
      setMsg(`${v.fullName} fue rechazado.`);
    } catch { setMsg('No se pudo rechazar la solicitud.'); }
    finally { setBusyId(null); }
  };

  return (
    <section style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px 60px' }}>
      <Link href="/" className="back">← Volver al inicio</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 20px' }}>
        <ShieldCheck size={22} style={{ color: 'var(--wine)' }} />
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-manrope)' }}>Panel de administración</h1>
      </div>

      {msg && <p style={{ fontSize: 13, color: '#5ba76a', background: '#eef7f0', borderRadius: 10, padding: '10px 14px' }}>{msg}</p>}

      <h2 style={{ fontSize: 16, marginBottom: 14 }}>Verificaciones pendientes</h2>

      {loadingItems ? (
        <p style={{ fontSize: 12, color: '#999' }}>Cargando…</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 13, color: '#888', background: '#faf7f8', borderRadius: 12, padding: 20 }}>
          No hay solicitudes de verificación pendientes.
        </p>
      ) : (
        items.map((v) => (
          <div key={v.uid} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 16, marginBottom: 12, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Award size={18} style={{ color: 'var(--wine)', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 15 }}>{v.fullName}</b>
                <p style={{ margin: '2px 0', fontSize: 12, color: '#888' }}>{v.email}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: 8, fontSize: 12 }}>
                  <span><b>Cédula:</b> {v.cedula || '—'}</span>
                  <span><b>Registro:</b> {v.registryNumber || '—'}</span>
                  <span><b>Universidad:</b> {v.university || '—'}</span>
                  <span><b>Experiencia:</b> {v.yearsExperience || '—'} años</span>
                  {v.price && <span><b>Precio:</b> {v.price}</span>}
                </div>
                {v.bio && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666', lineHeight: 1.5 }}>{v.bio}</p>}
                {v.certificadoURL && (
                  <a href={v.certificadoURL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--wine)', fontWeight: 600 }}>
                    📄 Ver título de abogado (PDF)
                  </a>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="landing-btn primary compact" disabled={busyId === v.uid} onClick={() => void handleApprove(v)}>
                    <Check size={14} /> Aprobar
                  </button>
                  <button className="landing-btn secondary compact" disabled={busyId === v.uid} onClick={() => void handleReject(v)}>
                    <X size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}