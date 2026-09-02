'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, MapPin, Search, Star, X, Calendar, Clock, Award } from 'lucide-react';
import LawyerCard from '@/app/components/LawyerCard';
import AuthDialog from '@/app/components/AuthDialog';
import type { LawyerData } from '@/app/components/LawyerCard';
import Skeleton from '@/app/components/Skeleton';
import { useAuth } from '@/lib/auth-context';
import { Lawyer, createConsultationRequest, fetchLawyers } from '@/lib/firebase/marketplace';

type LawyerFull = Lawyer;

const specialties = ['Todos', 'Derecho de familia', 'Derecho laboral', 'Propiedad intelectual', 'Derecho penal', 'Derecho tributario', 'Derecho constitucional'];

function AbogadosContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const abogadoParam = searchParams.get('abogado') || '';

  const [allLawyers, setAllLawyers] = useState<LawyerFull[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [specialty, setSpecialty] = useState('Todos');
  const [city, setCity] = useState('Todas');
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerFull | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLawyers()
      .then((list) => {
        if (active) setAllLawyers(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingList(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (abogadoParam && allLawyers.length > 0) {
      const found = allLawyers.find((l) => l.uid === abogadoParam || l.id === abogadoParam);
      if (found) setSelectedLawyer(found);
    }
  }, [abogadoParam, allLawyers]);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = allLawyers.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.role.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === 'Todos' || l.role === specialty;
    const matchCity = city === 'Todas' || l.city === city;
    return matchSearch && matchSpecialty && matchCity;
  });

  const cityOptions = useMemo(() => ['Todas', ...Array.from(new Set(allLawyers.map((l) => l.city).filter(Boolean)))], [allLawyers]);

  const handleBookSession = async (lawyer: LawyerFull) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSending(true);
    try {
      await createConsultationRequest(user.uid, user.email ?? '', lawyer);
      setToastMessage(`Solicitud enviada a ${lawyer.name}. Te contactaremos a ${user.email}.`);
      setSelectedLawyer(null);
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setSending(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <section className="marketplace">
      <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>
      <p className="eyebrow">MARKETPLACE JURÍDICO</p>
      <h1>Encuentra a tu abogado ideal</h1>
      <p className="lead">Profesionales verificados en Ecuador, listos para orientarte.</p>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: '#5ba76a' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="filters">
        <div style={{ position: 'relative', flex: 1 }}>
          <button style={{ width: '100%', color: '#777' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                font: 'inherit',
                color: '#333',
                flex: 1,
                width: '100%',
              }}
            />
          </button>
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            border: '1px solid var(--line)',
            borderRadius: '10px',
            padding: '11px 13px',
            fontSize: '12px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {cityOptions.map((c) => (
            <option key={c} value={c}>{c === 'Todas' ? '📍 Ciudad' : c}</option>
          ))}
        </select>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={{
            border: '1px solid var(--line)',
            borderRadius: '10px',
            padding: '11px 13px',
            fontSize: '12px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {specialties.map((s) => (
            <option key={s} value={s}>{s === 'Todos' ? 'Especialidad' : s}</option>
          ))}
        </select>
      </div>

      <p className="results">{loadingList ? 'Cargando abogados…' : `${filtered.length} abogados disponibles`}</p>

      {loadingList ? (
        <div className="market-grid" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="lawyer-card" key={i} style={{ cursor: 'default' }}>
              <div className="lawyer-head">
                <Skeleton width={46} height={46} radius="50%" />
                <Skeleton width={18} height={18} radius="50%" />
              </div>
              <Skeleton width="70%" height={15} style={{ marginBottom: 8 }} />
              <Skeleton width="45%" height={12} style={{ marginBottom: 10 }} />
              <Skeleton width="55%" height={11} />
              <div className="lawyer-bottom" style={{ marginTop: 14 }}>
                <Skeleton width={90} height={12} />
                <Skeleton width={52} height={14} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="market-grid">
          {filtered.map((l) => (
            <div key={l.id} onClick={() => setSelectedLawyer(l)} style={{ cursor: 'pointer' }}>
              <LawyerCard lawyer={l} />
            </div>
          ))}
        </div>
      )}

      {!loadingList && filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          No se encontraron abogados con esos criterios. Prueba ajustando los filtros.
        </p>
      )}

      {/* Lawyer Full Profile Modal */}
      {selectedLawyer && (
        <div className="dialog-bg" onClick={() => setSelectedLawyer(null)}>
          <div className="lawyer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedLawyer(null)}>
              <X size={18} />
            </button>

            <div className="lawyer-modal-header">
              <div className="lawyer-avatar-large" style={{ background: selectedLawyer.color }}>
                {selectedLawyer.initials}
              </div>
              <div>
                <h2>{selectedLawyer.name}</h2>
                <span className="lawyer-role-tag">{selectedLawyer.role}</span>
                <p className="lawyer-location">
                  <MapPin size={14} /> {selectedLawyer.city}
                </p>
                <div className="lawyer-rating-row">
                  <Star size={15} fill="#f5a623" stroke="#f5a623" />
                  <b>{selectedLawyer.rating}</b>
                  <span>({selectedLawyer.reviews})</span>
                </div>
              </div>
            </div>

            <div className="lawyer-modal-body">
              <div className="lawyer-detail-item">
                <Award size={16} />
                <div>
                  <strong>Formación académica</strong>
                  <p>{selectedLawyer.education}</p>
                </div>
              </div>

              <div className="lawyer-detail-item">
                <Clock size={16} />
                <div>
                  <strong>Experiencia</strong>
                  <p>{selectedLawyer.experience}</p>
                </div>
              </div>

              <div className="lawyer-detail-item">
                <Calendar size={16} />
                <div>
                  <strong>Perfil y especialización</strong>
                  <p>{selectedLawyer.bio}</p>
                </div>
              </div>

              {(selectedLawyer.certificadoURL || selectedLawyer.cvURL) && (
                <div className="lawyer-detail-item">
                  <FileText size={16} />
                  <div>
                    <strong>Documentos de respaldo</strong>
                    {selectedLawyer.certificadoURL && (
                      <p style={{ margin: '4px 0' }}>
                        <a href={selectedLawyer.certificadoURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wine)', fontSize: 13 }}>
                          📄 Ver título profesional (PDF)
                        </a>
                      </p>
                    )}
                    {selectedLawyer.cvURL && (
                      <p style={{ margin: '4px 0' }}>
                        <a href={selectedLawyer.cvURL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wine)', fontSize: 13 }}>
                          📋 Ver hoja de vida (PDF)
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lawyer-modal-footer">
              <span className="lawyer-modal-price">{selectedLawyer.price}</span>
              <button
                className="landing-btn primary compact"
                disabled={sending || user?.uid === selectedLawyer.uid}
                onClick={() => handleBookSession(selectedLawyer)}
              >
                <span>{sending ? 'Enviando…' : user?.uid === selectedLawyer.uid ? 'Eres tú' : 'Solicitar Asesoría'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {authOpen && <AuthDialog user={user} close={() => setAuthOpen(false)} />}
    </section>
  );
}

export default function AbogadosPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Cargando abogados…</div>}>
      <AbogadosContent />
    </Suspense>
  );
}
