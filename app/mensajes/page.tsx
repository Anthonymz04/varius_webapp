'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Check, MessageCircle, Search, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  AsesoriaRequest,
  Conversacion,
  Mensaje,
  createConversacion,
  fetchConversaciones,
  fetchClientRequests,
  fetchLawyerRequests,
  sendMessage,
  subscribeMessages,
  createRequest,
  updateRequestStatus,
} from '@/lib/firebase/asesorias';
import { fetchLawyers, Lawyer } from '@/lib/firebase/marketplace';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import FormattedText from '@/app/components/FormattedText';

function ChatInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [requests, setRequests] = useState<AsesoriaRequest[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [lawyerModal, setLawyerModal] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const active = conversaciones.find((c) => c.id === activeId) ?? null;
  const activeRequest = requests.find((r) => r.id === activeRequestId) ?? null;

  const loadAll = async (uid: string) => {
    const [convos, myReqs, mySent] = await Promise.all([
      fetchConversaciones(uid),
      fetchLawyerRequests(uid),
      fetchClientRequests(uid),
    ]);
    const seen = new Map<string, AsesoriaRequest>();
    [...myReqs, ...mySent].forEach((r) => {
      if (!seen.has(r.id) || r.createdAt > (seen.get(r.id)?.createdAt ?? 0)) seen.set(r.id, r);
    });
    const merged = Array.from(seen.values()).sort((a, b) => b.createdAt - a.createdAt);
    return { convos, requests: merged };
  };

  useEffect(() => {
    if (!user) return;
    let activeFlag = true;
    loadAll(user.uid).then(({ convos, requests: reqs }) => {
      if (!activeFlag) return;
      setConversaciones(convos);
      setRequests(reqs);
      const fromUrl = searchParams.get('conversacion');
      if (fromUrl && convos.some((c) => c.id === fromUrl)) setActiveId(fromUrl);
    });
    fetchLawyers().then((l) => { if (activeFlag) setLawyers(l); });
    return () => { activeFlag = false; };
  }, [user?.uid, searchParams]);

  useEffect(() => {
    if (!activeId) return;
    const unsub = subscribeMessages(activeId, setMessages);
    return () => unsub();
  }, [activeId]);

  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    let activeFlag = true;
    const poll = () => {
      if (!activeFlag) return;
      loadAll(user.uid).then(({ convos, requests: reqs }) => {
        if (!activeFlag) return;
        setConversaciones(convos);
        setRequests(reqs);
        if (activeId && !convos.some((c) => c.id === activeId)) {
          setActiveId(null);
        }
      });
    };
    const t = setInterval(poll, 15000);
    return () => { activeFlag = false; clearInterval(t); };
  }, [user?.uid, activeId]);

  if (!user) {
    return (
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Inicia sesión</h1>
        <p className="lead">Necesitas una cuenta para ver tus asesorías.</p>
      </section>
    );
  }

  const otherName = (c: Conversacion) => (c.clientId === user.uid ? c.lawyerName : c.clientName);

  const handleSend = async () => {
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(activeId, user.uid, draft.trim());
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
                  <b>{otherName(c)}</b>
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
                <span>{otherName(active)}</span>
                {active.clientId === user.uid && (
                  <button onClick={() => setLawyerModal(true)} style={{ fontSize: 12, color: 'var(--wine)' }}>
                    Buscar otro abogado
                  </button>
                )}
              </div>
              <div className="mensajes-chat-body" ref={chatBodyRef}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#999', padding: '30px 0' }}>
                    Asesoría iniciada. Presenta tu consulta al abogado.
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`mensaje ${m.senderId === user.uid ? 'user' : 'ai'}`}>
                    <div className="msg-content"><FormattedText text={m.text} /></div>
                  </div>
                ))}
              </div>
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