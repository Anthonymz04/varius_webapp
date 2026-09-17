'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, MapPin, Search, Star, Trash2, X, Calendar, Clock, Award } from 'lucide-react';
import LawyerCard from '@/app/components/LawyerCard';
import AuthDialog from '@/app/components/AuthDialog';
import type { LawyerData } from '@/app/components/LawyerCard';
import Skeleton from '@/app/components/Skeleton';
import { useAuth } from '@/lib/auth-context';
import { Lawyer, createConsultationRequest, fetchLawyers } from '@/lib/firebase/marketplace';
import {
  LawyerReview,
  deleteLawyerReview,
  fetchAllReviews,
  submitLawyerReview,
} from '@/lib/firebase/social';

type LawyerFull = Lawyer;

const specialties = ['Todos', 'Derecho de familia', 'Derecho laboral', 'Propiedad intelectual', 'Derecho penal', 'Derecho tributario', 'Derecho constitucional'];

function StarRow({ value, onSelect, size = 22 }: { value: number; onSelect?: (v: number) => void; size?: number }) {
  return (
    <span className="star-row" role={onSelect ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          className="star-btn"
          aria-label={`${v} estrellas`}
          onClick={onSelect ? () => onSelect(v) : undefined}
          disabled={!onSelect}
        >
          <Star size={size} fill={v <= value ? '#f5a623' : 'none'} stroke={v <= value ? '#f5a623' : '#ccc'} />
        </button>
      ))}
    </span>
  );
}

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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<LawyerReview[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const loadReviews = useCallback(async () => {
    setReviews(await fetchAllReviews());
  }, []);

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
    void loadReviews();
    return () => { active = false; };
  }, [loadReviews]);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    const { fetchFavoriteIds } = await import('@/lib/firebase/social');
    setFavorites(new Set(await fetchFavoriteIds(user.uid)));
  }, [user?.uid ?? null]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (abogadoParam && allLawyers.length > 0) {
      const found = allLawyers.find((l) => l.uid === abogadoParam || l.id === abogadoParam);
      if (found) setSelectedLawyer(found);
    }
  }, [abogadoParam, allLawyers]);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const reviewsByLawyer = useMemo(() => {
    const map = new Map<string, LawyerReview[]>();
    for (const r of reviews) {
      const list = map.get(r.lawyerId) ?? [];
      list.push(r);
      map.set(r.lawyerId, list);
    }
    return map;
  }, [reviews]);

  const withLiveRating = useMemo(
    () =>
      allLawyers.map((l) => {
        const list = reviewsByLawyer.get(l.id) ?? reviewsByLawyer.get(l.uid ?? '__none__') ?? [];
        if (!list.length) return l;
        const avg = list.reduce((acc, r) => acc + r.rating, 0) / list.length;
        return {
          ...l,
          rating: (Math.round(avg * 10) / 10).toFixed(1),
          reviews: `${list.length} reseña${list.length === 1 ? '' : 's'}`,
        };
      }),
    [allLawyers, reviewsByLawyer]
  );

  const filtered = useMemo(() => {
    const list = withLiveRating.filter((l) => {
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.role.toLowerCase().includes(search.toLowerCase());
      const matchSpecialty = specialty === 'Todos' || l.role === specialty;
      const matchCity = city === 'Todas' || l.city === city;
      return matchSearch && matchSpecialty && matchCity;
    });
    return [...list].sort((a, b) => {
      const fa = favorites.has(a.id) || favorites.has(a.uid ?? '');
      const fb = favorites.has(b.id) || favorites.has(b.uid ?? '');
      if (fa !== fb) return fa ? -1 : 1;
      return 0;
    });
  }, [withLiveRating, search, specialty, city, favorites]);

  const cityOptions = useMemo(() => ['Todas', ...Array.from(new Set(allLawyers.map((l) => l.city).filter(Boolean)))], [allLawyers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const isFav = (l: LawyerFull) => favorites.has(l.id) || favorites.has(l.uid ?? '');

  const handleToggleFavorite = async (l: LawyerFull) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    const wasFav = isFav(l);
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(l.id);
      next.delete(l.uid ?? '');
      if (!wasFav) {
        if (l.id) next.add(l.id);
        if (l.uid) next.add(l.uid);
      }
      return next;
    });
    try {
      const { toggleFavorite } = await import('@/lib/firebase/social');
      await toggleFavorite(user.uid, l.uid || l.id);
    } catch {
      void loadFavorites();
      showToast('No se pudo actualizar tus favoritos.');
    }
  };

  const selectedLawyerReviews = selectedLawyer
    ? reviewsByLawyer.get(selectedLawyer.id) ?? reviewsByLawyer.get(selectedLawyer.uid ?? '__none__') ?? []
    : [];
  const myReview = selectedLawyerReviews.find((r) => r.authorUid === user?.uid) ?? null;

  useEffect(() => {
    if (selectedLawyer && user) {
      setReviewRating(myReview?.rating ?? 0);
      setReviewComment(myReview?.comment ?? '');
    } else {
      setReviewRating(0);
      setReviewComment('');
    }
  }, [selectedLawyer?.id, user?.uid, myReview?.rating, myReview?.comment]);

  const handleSaveReview = async () => {
    if (!user || !selectedLawyer || !reviewRating) return;
    setSavingReview(true);
    try {
      await submitLawyerReview({
        lawyerId: selectedLawyer.uid || selectedLawyer.id,
        lawyerUid: selectedLawyer.uid ?? '',
        authorUid: user.uid,
        authorName: user.displayName || 'Usuario VARIUS',
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      await loadReviews();
      showToast(myReview ? 'Tu reseña fue actualizada.' : '¡Gracias por tu reseña!');
    } catch {
      showToast('No se pudo guardar tu reseña. Inténtalo de nuevo.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !selectedLawyer || !myReview) return;
    if (!window.confirm('¿Eliminar tu reseña?')) return;
    try {
      await deleteLawyerReview(selectedLawyer.uid || selectedLawyer.id, user.uid);
      await loadReviews();
      showToast('Tu reseña fue eliminada.');
    } catch {
      showToast('No se pudo eliminar tu reseña.');
    }
  };

  const handleBookSession = async (lawyer: LawyerFull) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSending(true);
    try {
      await createConsultationRequest(user.uid, user.email ?? '', lawyer, undefined, user.displayName ?? '');
      showToast(`Solicitud enviada a ${lawyer.name}. Te contactaremos a ${user.email}.`);
      setSelectedLawyer(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="marketplace">
      <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>
      <p className="eyebrow">MARKETPLACE JURÍDICO</p>
      <h1>Encuentra a tu abogado ideal</h1>
      <p className="lead">Profesionales verificados en Ecuador, listos para orientarte. Tus favoritos aparecen primero.</p>

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
              <LawyerCard
                lawyer={l}
                isFavorite={isFav(l)}
                onToggleFavorite={() => void handleToggleFavorite(l)}
              />
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

              <div className="lawyer-reviews-block">
                <div className="lawyer-reviews-head">
                  <strong>Reseñas ({selectedLawyerReviews.length})</strong>
                  {user && user.uid !== selectedLawyer.uid && (
                    <span className="lawyer-reviews-hint">Deja tu valoración</span>
                  )}
                </div>

                {selectedLawyerReviews.length === 0 && (
                  <p className="lawyer-reviews-empty">
                    Todavía no hay reseñas para este abogado. Sé el primero en opinar.
                  </p>
                )}

                {selectedLawyerReviews
                  .filter((r) => r.authorUid !== user?.uid)
                  .map((r) => (
                    <div key={r.id} className="lawyer-review">
                      <div className="lawyer-review-top">
                        <b>{r.authorName}</b>
                        <StarRow value={r.rating} size={13} />
                      </div>
                      {r.comment && <p>{r.comment}</p>}
                    </div>
                  ))}

                {user && user.uid !== selectedLawyer.uid ? (
                  <div className="lawyer-review-form">
                    <StarRow value={reviewRating} onSelect={setReviewRating} />
                    <textarea
                      placeholder="Escribe un comentario sobre tu experiencia (opcional)…"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="lawyer-review-form-actions">
                      <button
                        className="landing-btn primary compact"
                        disabled={!reviewRating || savingReview}
                        onClick={() => void handleSaveReview()}
                      >
                        {savingReview ? 'Guardando…' : myReview ? 'Actualizar mi reseña' : 'Enviar reseña'}
                      </button>
                      {myReview && (
                        <button className="review-delete-btn" onClick={() => void handleDeleteReview()}>
                          <Trash2 size={14} /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ) : !user ? (
                  <p className="lawyer-reviews-login">
                    <button className="auth-terms-link" onClick={() => setAuthOpen(true)}>Inicia sesión</button> para dejar tu reseña.
                  </p>
                ) : null}
              </div>
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
