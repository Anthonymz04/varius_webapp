'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Check, MessageCircle, Search, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  AsesoriaRequest,
  Conversacion,
  Mensaje,
  createConversacion,
  fetchMessages,
  sendMessage,
  subscribeMessages,
  subscribeConversaciones,
  subscribeRequests,
  createRequest,
  updateRequestStatus,
  finalizarConversacion,
} from '@/lib/firebase/asesorias';
import { fetchLawyers, Lawyer } from '@/lib/firebase/marketplace';
import { fetchUserProfile } from '@/lib/firebase/profile';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import FormattedText from '@/app/components/FormattedText';

function ChatInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [requests, setRequests] = useState<AsesoriaRequest[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, { displayName?: string; photoURL?: string | null }>>({});
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [lawyerModal, setLawyerModal] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const active = conversaciones.find((c) => c.id === activeId) ?? null;
  const activeRequest = requests.find((r) => r.id === activeRequestId) ?? null;

  useEffect(() => {
    if (!user) return;
    const unsubs: (() => void)[] = [];
    unsubs.push(subscribeConversaciones(user.uid, (list) => {
      setConversaciones(list);
      const fromUrl = searchParams.get('conversacion');
      if (fromUrl && list.some((c) => c.id === fromUrl)) setActiveId(fromUrl);
    }));
    unsubs.push(subscribeRequests(user.uid, setRequests));
    fetchLawyers().then((l) => setLawyers(l));
    return () => unsubs.forEach((u) => u());
  }, [user?.uid, searchParams]);

  useEffect(() => {
    if (!activeId) return;
    let activeFlag = true;
    fetchMessages(activeId).then((list) => { if (activeFlag) setMessages(list); });
    const unsub = subscribeMessages(activeId, (list) => { if (activeFlag) setMessages(list); });
    return () => { activeFlag = false; unsub(); };
  }, [activeId]);

  useEffect(() => {
    if (!active) return;
    let activeFlag = true;
    const ids = [active.clientId, active.lawyerId];
    Promise.all(ids.map((id) => fetchUserProfile(id)))
      .then((profiles) => {
        if (!activeFlag) return;
        const next: Record<string, { displayName?: string; photoURL?: string | null }> = {};
        ids.forEach((id, i) => { if (profiles[i]) next[id] = profiles[i] as { displayName?: string; photoURL?: string | null }; });
        setProfileCache((prev) => ({ ...prev, ...next }));
      });
    return () => { activeFlag = false; };
  }, [active?.clientId, active?.lawyerId]);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeId, activeRequestId]);

  if (!user) {
    return (
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Inicia sesión</h1>
        <p className="lead">Necesitas una cuenta para ver tus asesorías.</p>
      </section>
    );
  }

  const otherName = (c: Conversacion) => (c.clientId === user.uid ? c.lawyerName : c.clientName);

  const initialsOf = (name: string) => name.trim().split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase() || '?';

  const senderOf = (m: Mensaje) => {
    const client = profileCache[active?.clientId ?? ''] ?? {};
    const lawyer = profileCache[active?.lawyerId ?? ''] ?? {};
    const isClient = m.senderId === active?.clientId;
    const name = m.senderName || (isClient ? (client.displayName || active?.clientName || 'Usuario') : (lawyer.displayName || active?.lawyerName || 'Abogado'));
    const photo = m.senderPhotoURL || (isClient ? client.photoURL || null : lawyer.photoURL || null);
    return { name, photo };
  };

  const goToProfile = (senderId: string) => {
    if (senderId === user.uid) { router.push('/perfil'); return; }
    const isLawyer = lawyers.some((l) => (l as Lawyer & { uid?: string }).uid === senderId);
    if (isLawyer) { router.push(`/abogados?abogado=${senderId}`); return; }
    router.push('/perfil');
  };

  const handleSend = async () => {
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(activeId, user.uid, draft.trim(), user.displayName || 'Usuario VARIUS', user.photoURL ?? '');
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  const handleRequest = async (lawyer: Lawyer) => {
    if (!user) return;
    try {
      await createRequest({
        clientId: user.uid,
        clientName: user.displayName || 'Usuario VARIUS',
        clientEmail: user.email ?? '',
        lawyerId: (lawyer as Lawyer & { uid?: string }).uid ?? '',
        lawyerName: lawyer.name,
      });
      setLawyerModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo enviar la solicitud.');
    }
  };

  const acceptRequest = async (req: AsesoriaRequest) => {
    if (!user) return;
    setAccepting(true);
    try {
      await updateRequestStatus(req.id, 'aceptada');
      const convId = await createConversacion({
        clientId: req.clientId,
        clientName: req.clientName,
        lawyerId: user.uid,
        lawyerName: user.displayName || 'Abogado VARIUS',
        requestId: req.id,
      });
      setActiveRequestId(null);
      setActiveId(convId);
    } catch {
      alert('No se pudo aceptar la solicitud.');
    } finally {
      setAccepting(false);
    }
  };

  const rejectRequest = async (req: AsesoriaRequest) => {
    if (!user) return;
    try {
      await updateRequestStatus(req.id, 'rechazada');
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'rechazada' } : r));
      setActiveRequestId(null);
    } catch {
      alert('No se pudo rechazar la solicitud.');
    }
  };

  const handleClose = async () => {
    if (!active || active.lawyerId !== user.uid || closing) return;
    if (!window.confirm('¿Finalizar esta asesoría? Se cerrará el chat y ya no se podrán enviar mensajes.')) return;
    setClosing(true);
    try {
      await finalizarConversacion(active.id);
    } catch {
      alert('No se pudo finalizar la asesoría.');
    } finally {
      setClosing(false);
    }
  };

  const isClosed = active?.status === 'finalizada';

  return (
    <section className="mensajes-page">
      <div className="mensajes-head">
        <Link href="/" className="back" aria-label="Volver al inicio"><ArrowLeft size={16} /></Link>
        <h1>Mis asesorías</h1>
      </div>

      <div className="mensajes-layout">
        <div className="mensajes-list">
          {requests.length === 0 && conversaciones.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#888' }}>
              <MessageCircle size={28} style={{ margin: '0 auto 10px', color: 'var(--wine)' }} />
              <p style={{ margin: 0 }}>Aún no tienes asesorías activas. Solicita una desde el asistente IA o el marketplace.</p>
            </div>
          ) : (
            <>
              {requests.filter((r) => r.status === 'pendiente').length > 0 && (
                <div className="mensajes-group">Solicitudes de asesoría</div>
              )}
              {requests.filter((r) => r.status === 'pendiente').map((r) => {
                const iAmLawyer = r.lawyerId === user.uid;
                return (
                  <button
                    key={`req-${r.id}`}
                    className={`mensaje-item ${activeRequestId === r.id ? 'active' : ''}`}
                    onClick={() => { setActiveRequestId(r.id); setActiveId(null); }}
                  >
                    <b>{iAmLawyer ? `${r.clientName} busca asesoría` : `Solicitud con ${r.lawyerName}`}</b>
                    <span>{iAmLawyer ? 'Responder solicitud' : 'Esperando respuesta del abogado'}</span>
                    <small>{new Date(r.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</small>
                  </button>
                );
              })}
              <div className="mensajes-group">Mis asesorías</div>
              {conversaciones.map((c) => (
                <button
                  key={c.id}
                  className={`mensaje-item ${c.id === activeId ? 'active' : ''}`}
                  onClick={() => { setActiveId(c.id); setActiveRequestId(null); }}
                >
                  <b>{otherName(c)}{c.status === 'finalizada' && <em className="mchat-badge">Finalizada</em>}</b>
                  <span>{c.lastMessage}</span>
                  <small>{new Date(c.lastMessageAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</small>
                </button>
              ))}
            </>
          )}
          {lawyers.length > 0 && (
            <button className="mensaje-new" onClick={() => setLawyerModal(true)}>
              Buscar un abogado <Search size={14} />
            </button>
          )}
        </div>

        <div className="mensajes-chat">
          {activeRequest ? (
            (() => {
              const iAmLawyer = activeRequest.lawyerId === user.uid;
              return (
                <>
                  <div className="mensajes-chat-head">
                    <span>{iAmLawyer ? `Solicitud de ${activeRequest.clientName || 'usuario'}` : `Solicitud con ${activeRequest.lawyerName}`}</span>
                  </div>
                  <div className="mensajes-chat-body" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                    <div style={{ maxWidth: 420, padding: 30 }}>
                      <MessageCircle size={40} style={{ color: 'var(--wine)', margin: '0 auto 14px' }} />
                      <b style={{ fontSize: 15, display: 'block', marginBottom: 6 }}>
                        {iAmLawyer ? `${activeRequest.clientName || 'Un usuario'} te ha solicitado una asesoría` : `Solicitud enviada a ${activeRequest.lawyerName}`}
                      </b>
                      {activeRequest.topic && (
                        <p style={{ fontSize: 13, color: '#666', background: '#faf7f7', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', lineHeight: 1.5 }}>
                          <b style={{ display: 'block', color: '#888', fontSize: 11, marginBottom: 4 }}>TEMA</b>{activeRequest.topic}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: '#999', margin: '14px 0 0' }}>
                        {iAmLawyer ? 'Si aceptas, se abrirá un chat directo con el cliente.' : 'En cuanto el abogado acepte tu solicitud, este chat se activará.'}
                      </p>
                      {iAmLawyer && (
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
                          <button className="landing-btn primary compact" disabled={accepting} onClick={() => void acceptRequest(activeRequest)}>
                            <Check size={15} /> {accepting ? 'Aceptando…' : 'Aceptar'}
                          </button>
                          <button className="landing-btn secondary compact" disabled={accepting} onClick={() => void rejectRequest(activeRequest)}>
                            <X size={15} /> Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()
          ) : !active ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>
              Selecciona una solicitud o asesoría para ver el chat, o busca un abogado para iniciar una nueva.
            </div>
          ) : (
            <>
              <div className="mensajes-chat-head">
                <span>
                  {otherName(active)}
                  {isClosed && <em className="mchat-badge">Finalizada</em>}
                </span>
                {active.lawyerId === user.uid ? (
                  <button onClick={handleClose} disabled={closing || isClosed} style={{ fontSize: 12, color: isClosed ? '#aaa' : 'var(--wine)', cursor: isClosed ? 'default' : 'pointer' }}>
                    {closing ? 'Finalizando…' : 'Finalizar asesoría'}
                  </button>
                ) : active.clientId === user.uid ? (
                  <button onClick={() => setLawyerModal(true)} style={{ fontSize: 12, color: 'var(--wine)' }}>
                    Buscar otro abogado
                  </button>
                ) : null}
              </div>
              <div className="mensajes-chat-body" ref={chatBodyRef}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#999', padding: '30px 0' }}>
                    Asesoría iniciada. Presenta tu consulta al abogado.
                  </div>
                )}
                {messages.map((m) => {
                  const mine = m.senderId === user.uid;
                  const sender = senderOf(m);
                  return (
                    <div key={m.id} className={`mchat ${mine ? 'mine' : ''}`}>
                      <div className="mchat-avatar">
                        {sender.photo ? (
                          <img src={sender.photo} alt="" />
                        ) : (
                          <span style={{ background: mine ? '#c2185b' : '#d8ad96' }}>{initialsOf(sender.name)}</span>
                        )}
                      </div>
                      <div className="mchat-col">
                        <div className="mchat-meta">
                          <button type="button" className="mchat-name" onClick={() => goToProfile(m.senderId)}>
                            {sender.name}
                          </button>
                          <span className="mchat-time">{new Date(m.createdAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="mchat-bubble"><FormattedText text={m.text} /></div>
                      </div>
                    </div>
                  );
                })}
                {isClosed && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#999', padding: '20px 0' }}>
                    Esta asesoría fue finalizada por el abogado.
                  </div>
                )}
              </div>
              {isClosed ? (
                <div style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, color: '#999', borderTop: '1px solid var(--line)' }}>
                  Chat cerrado — la asesoría fue finalizada.
                </div>
              ) : (
                <div className="mensajes-composer">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                    placeholder="Escribe tu consulta…"
                  />
                  <button className="landing-btn primary compact" onClick={handleSend} disabled={sending || !draft.trim()}>
                    <Send size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {lawyerModal && (
        <div className="dialog-bg" onClick={() => setLawyerModal(false)}>
          <div className="lawyer-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setLawyerModal(false)}>✕</button>
            <div className="lawyer-modal-body">
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>Elige un abogado</h2>
              <p style={{ fontSize: 13, color: '#777', marginBottom: 14 }}>Se enviará una solicitud de asesoría que el abogado podrá aceptar o rechazar.</p>
              {lawyers.filter((l) => (l as Lawyer & { uid?: string }).uid !== user?.uid).map((l) => (
                <button
                  key={l.id}
                  onClick={() => void handleRequest(l)}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 12, marginBottom: 8, background: '#fff' }}
                >
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: l.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{l.initials}</span>
                  <span style={{ textAlign: 'left' }}>
                    <b style={{ fontSize: 13, display: 'block' }}>{l.name}</b>
                    <small style={{ color: '#888' }}>{l.role} · {l.city}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function MensajesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#999' }}>Cargando…</div>}>
      <ChatInner />
    </Suspense>
  );
}