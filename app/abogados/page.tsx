'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MapPin, Search, Star, X, Calendar, Clock, Award } from 'lucide-react';
import LawyerCard from '@/app/components/LawyerCard';
import AuthDialog from '@/app/components/AuthDialog';
import type { LawyerData } from '@/app/components/LawyerCard';
import { useAuth } from '@/lib/auth-context';

const fallbackLawyers: (LawyerData & { bio: string; education: string; experience: string })[] = [
  {
    name: 'Valentina Mena',
    role: 'Derecho de familia',
    city: 'Quito, Ecuador',
    rating: '4.9',
    reviews: '124 reseñas',
    price: '$45 / consulta',
    color: '#d8ad96',
    initials: 'VM',
    bio: 'Especialista en demandas de alimentos, divorcios, custodia de menores y régimen de visitas en Ecuador. Más de 8 años asistiendo familias.',
    education: 'Universidad Central del Ecuador · Máster en Derecho de Familia',
    experience: '8+ años de ejercicio profesional',
  },
  {
    name: 'Santiago Rivas',
    role: 'Derecho laboral',
    city: 'Guayaquil, Ecuador',
    rating: '4.8',
    reviews: '98 reseñas',
    price: '$38 / consulta',
    color: '#7e907d',
    initials: 'SR',
    bio: 'Abogado laboralista. Asesoría en despidos intempestivos, actas de finiquito, mediación laboral y demandas ante el Ministerio del Trabajo.',
    education: 'Universidad de Guayaquil · Especialista en Derecho Laboral',
    experience: '10+ años asesorando trabajadores y empresas',
  },
  {
    name: 'Elena Paredes',
    role: 'Propiedad intelectual',
    city: 'Atención virtual',
    rating: '5.0',
    reviews: '76 reseñas',
    price: '$55 / consulta',
    color: '#9f7f8c',
    initials: 'EP',
    bio: 'Registro de marcas en el SENADI, patentes, derechos de autor y protección de startups. Consultas 100% online.',
    education: 'Universidad San Francisco de Quito · LL.M. IP Law',
    experience: '7 años en consultoría LegalTech y propiedad intelectual',
  },
  {
    name: 'Carlos Mendoza',
    role: 'Derecho penal',
    city: 'Cuenca, Ecuador',
    rating: '4.7',
    reviews: '63 reseñas',
    price: '$50 / consulta',
    color: '#8b7d9b',
    initials: 'CM',
    bio: 'Defensa penal técnica en procesos según el COIP. Medidas cautelares, hábeas corpus y acompañamiento a audiencias.',
    education: 'Universidad de Cuenca · Máster en Ciencias Penales',
    experience: '12 años de práctica procesal penal',
  },
  {
    name: 'María Fernández',
    role: 'Derecho tributario',
    city: 'Quito, Ecuador',
    rating: '4.9',
    reviews: '112 reseñas',
    price: '$60 / consulta',
    color: '#d89696',
    initials: 'MF',
    bio: 'Planificación fiscal, reclamos administrativos ante el SRI y defensas tributarias en el Tribunal Contencioso.',
    education: 'Universidad Andina Simón Bolívar · Especialidad en Tributación',
    experience: '9 años en consultoría fiscal corporativa',
  },
  {
    name: 'Andrés López',
    role: 'Derecho constitucional',
    city: 'Guayaquil, Ecuador',
    rating: '4.6',
    reviews: '45 reseñas',
    price: '$42 / consulta',
    color: '#7d8e90',
    initials: 'AL',
    bio: 'Acciones de protección, hábeas data y recursos de inconstitucionalidad ante la Corte Constitucional del Ecuador.',
    education: 'Universidad Católica de Santiago de Guayaquil',
    experience: '6 años en litigio constitucional',
  },
];

const specialties = ['Todos', 'Derecho de familia', 'Derecho laboral', 'Propiedad intelectual', 'Derecho penal', 'Derecho tributario', 'Derecho constitucional'];
const cities = ['Todas', 'Quito, Ecuador', 'Guayaquil, Ecuador', 'Cuenca, Ecuador', 'Atención virtual'];

function AbogadosContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [specialty, setSpecialty] = useState('Todos');
  const [city, setCity] = useState('Todas');
  const [selectedLawyer, setSelectedLawyer] = useState<typeof fallbackLawyers[0] | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = fallbackLawyers.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.role.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === 'Todos' || l.role === specialty;
    const matchCity = city === 'Todas' || l.city === city;
    return matchSearch && matchSpecialty && matchCity;
  });

  const handleBookSession = (lawyer: typeof fallbackLawyers[0]) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setToastMessage(`Solicitud enviada a ${lawyer.name}. Te contactaremos a ${user.email}.`);
    setTimeout(() => setToastMessage(null), 5000);
    setSelectedLawyer(null);
  };

  return (
    <section className="marketplace">
      <Link href="/" className="back">← Volver al inicio</Link>
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
          {cities.map((c) => (
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

      <p className="results">{filtered.length} abogados disponibles</p>

      <div className="market-grid">
        {filtered.map((l) => (
          <div key={l.name} onClick={() => setSelectedLawyer(l)} style={{ cursor: 'pointer' }}>
            <LawyerCard lawyer={l} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
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
            </div>

            <div className="lawyer-modal-footer">
              <span className="lawyer-modal-price">{selectedLawyer.price}</span>
              <button
                className="landing-btn primary compact"
                onClick={() => handleBookSession(selectedLawyer)}
              >
                <span>Solicitar Asesoría</span>
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
