'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, Scale, Shield, Users, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import AuthDialog from '@/app/components/AuthDialog';
import { Tutorialia, crearReserva, getTutorias } from '@/lib/firebase/tutorias';

const iconMap = {
  scale: Scale,
  shield: Shield,
  users: Users,
  book: BookOpen,
};

const HORAS_DISPONIBLES = ['09:00', '11:00', '15:00', '17:00'];

function fechaMinima(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function TutoriasPage() {
  const { user } = useAuth();
  const tutorias = getTutorias();

  const [selected, setSelected] = useState<Tutorialia | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState(HORAS_DISPONIBLES[0]);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const abrirModal = (t: Tutorialia) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setFecha('');
    setSelected(t);
  };

  const confirmarReserva = async () => {
    if (!selected || !user || !fecha) return;
    setSaving(true);
    try {
      await crearReserva(user.uid, user.email ?? '', selected, fecha, hora);
      setSelected(null);
      setToast(`Reserva confirmada: "${selected.title}" el ${fecha} a las ${hora}.`);
    } catch {
      setToast('No se pudo confirmar la reserva. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <section className="tutorials-page">
      <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>
      <p className="eyebrow">TUTORÍAS Y GUÍAS</p>
      <h1>Aprende Derecho de forma práctica</h1>
      <p className="lead">
        Guías paso a paso y sesiones 1:1 con profesionales del Derecho ecuatoriano. Elige una tutoría y reserva tu horario.
      </p>

      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: '#5ba76a' }} />
          <span>{toast}</span>
        </div>
      )}

      <div className="tutorial-grid">
        {tutorias.map((t) => {
          const Icon = iconMap[t.icon];
          return (
            <article className="tutorial-card" key={t.id}>
              <div className="tutorial-visual">
                <Icon size={40} />
              </div>
              <div className="tutorial-body">
                <label>{t.label}</label>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <div className="tutorial-meta">
                  <span>👤 {t.tutor}</span>
                  <span>📚 {t.level}</span>
                  <span>⏱ {t.duration}</span>
                </div>
                <button className="landing-btn secondary compact" onClick={() => abrirModal(t)}>
                  <Calendar size={15} /> <span>Reservar sesión</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="dialog-bg" onClick={() => setSelected(null)}>
          <div className="lawyer-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
            <div className="lawyer-modal-body">
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>{selected.title}</h2>
              <p style={{ color: '#888', fontSize: 13 }}>
                {selected.tutor} · {selected.level} · {selected.duration}
              </p>
              <p style={{ fontSize: 13, color: '#555', marginTop: 12 }}>
                Elige la fecha y la hora para tu sesión en línea. Recibirás la confirmación en{' '}
                <b>{user?.email}</b>.
              </p>

              <div className="lawyer-detail-item" style={{ marginTop: 16 }}>
                <Calendar size={16} />
                <div style={{ flex: 1 }}>
                  <strong>Fecha</strong>
                  <input
                    type="date"
                    min={fechaMinima()}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 6,
                      padding: '10px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      font: 'inherit',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div className="lawyer-detail-item">
                <Clock size={16} />
                <div style={{ flex: 1 }}>
                  <strong>Hora</strong>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {HORAS_DISPONIBLES.map((h) => (
                      <button
                        key={h}
                        onClick={() => setHora(h)}
                        className="chip"
                        style={hora === h ? { background: 'var(--wine)', color: '#fff', borderColor: 'var(--wine)' } : undefined}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lawyer-modal-footer">
              <button
                className="landing-btn primary compact"
                disabled={!fecha || saving}
                onClick={confirmarReserva}
                style={!fecha ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <span>{saving ? 'Confirmando…' : 'Confirmar reserva'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {authOpen && <AuthDialog user={null} close={() => setAuthOpen(false)} />}
    </section>
  );
}
