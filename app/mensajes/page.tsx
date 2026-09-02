'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Download, FileText, MessageCircle, Paperclip, Pin, PinOff, Reply, Search, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  AsesoriaRequest,
  Conversacion,
  Mensaje,
  ChatMessageInput,
  createConversacion,
  fetchMessages,
  fetchPinnedMessages,
  sendChatMessage,
  togglePinMessage,
  subscribeMessages,
  subscribeConversaciones,
  subscribeRequests,
  createRequest,
  updateRequestStatus,
  finalizarConversacion,
} from '@/lib/firebase/asesorias';
import { uploadChatFile } from '@/lib/firebase/uploads';
import { fetchLawyers, Lawyer } from '@/lib/firebase/marketplace';
import { fetchUserProfile } from '@/lib/firebase/profile';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import FormattedText from '@/app/components/FormattedText';

function formatSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ChatInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [requests, setRequests] = useState<AsesoriaRequest[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [pinned, setPinned] = useState<Mensaje[]>([]);
  const [profileCache, setProfileCache] = useState<Record<string, { displayName?: string; photoURL?: string | null }>>({});
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [replyingTo, setReplyingTo] = useState<Mensaje | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [lawyerModal, setLawyerModal] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fetchPinnedMessages(activeId).then((list) => { if (activeFlag) setPinned(list); });
    const unsub = subscribeMessages(activeId, (list) => {
      if (!activeFlag) return;
      setMessages(list);
      setPinned(list.filter((m) => m.pinned));
    });
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
    if (!user) return;
    const ids = new Set<string>();
    conversaciones.forEach((c) => { ids.add(c.clientId); ids.add(c.lawyerId); });
    requests.forEach((r) => { ids.add(r.clientId); ids.add(r.lawyerId); });
    const missing = [...ids].filter((id) => id && id !== user.uid && !profileCache[id]);
    if (missing.length === 0) return;
    let activeFlag = true;
    Promise.all(missing.map((id) => fetchUserProfile(id).catch(() => null)))
      .then((profiles) => {
        if (!activeFlag) return;
        const next = { ...profileCache };
        missing.forEach((id, i) => { if (profiles[i]) next[id] = profiles[i] as { displayName?: string; photoURL?: string | null }; });
        setProfileCache(next);
      });
    return () => { activeFlag = false; };
  }, [user?.uid, conversaciones, requests]);

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

  const otherName = (c: Conversacion) => {
    if (c.clientId === user.uid) return c.lawyerName || 'Abogado';
    const client = profileCache[c.clientId];
    return client?.displayName || c.clientName || 'Usuario';
  };

  const requestCounterpartName = (r: AsesoriaRequest) => {
    const iAmLawyer = r.lawyerId === user.uid;
    if (iAmLawyer) {
      const client = profileCache[r.clientId];
      return client?.displayName || r.clientName || 'Un usuario';
    }
    return r.lawyerName || 'Abogado';
  };

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
    if (!activeId || sending || uploading) return;
    const text = draft.trim();
    if (!text) return;
    const input: ChatMessageInput = { text };
    if (replyingTo) {
      input.replyTo = { msgId: replyingTo.id, text: replyingTo.text || replyingTo.fileName || '', senderName: senderOf(replyingTo).name };
    }
    setSending(true);
    try {
      await sendChatMessage(activeId, user.uid, input, user.displayName || 'Usuario VARIUS', user.photoURL ?? '');
      setDraft('');
      setReplyingTo(null);
    } finally {
      setSending(false);
    }
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeId || uploading) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadChatFile(activeId, file, setUploadProgress);
      const input: ChatMessageInput = {
        text: draft.trim(),
        fileURL: url,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
      };
      if (replyingTo) {
        input.replyTo = { msgId: replyingTo.id, text: replyingTo.text || replyingTo.fileName || '', senderName: senderOf(replyingTo).name };
      }
      await sendChatMessage(activeId, user.uid, input, user.displayName || 'Usuario VARIUS', user.photoURL ?? '');
      setDraft('');
      setReplyingTo(null);
    } catch {
      alert('No se pudo subir el archivo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleTogglePin = async (m: Mensaje) => {
    if (!activeId) return;
    try {
      await togglePinMessage(activeId, m.id, !m.pinned);
      setPinned((prev) => m.pinned ? prev.filter((p) => p.id !== m.id) : prev.some((p) => p.id === m.id) ? prev : [...prev, m]);
      setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, pinned: !m.pinned } : x));
    } catch {
      alert('No se pudo anclar el mensaje.');
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

  const handleClose = () => {
    if (!active || active.lawyerId !== user.uid || closing) return;
    setCloseModal(true);
  };

  const confirmClose = async () => {
    if (!active || closing) return;
    setClosing(true);
    try {
      await finalizarConversacion(active.id);
      setCloseModal(false);
    } catch {
      alert('No se pudo finalizar la asesoría.');
    } finally {
      setClosing(false);
    }
  };

  const isClosed = active?.status === 'finalizada';
  const isImage = (m: Mensaje) => (m.fileType ?? '').startsWith('image/');
  const extOf = (name: string) => { const i = name.lastIndexOf('.'); return i > 0 ? name.slice(i).toLowerCase() : ''; };

  const renderFile = (m: Mensaje) => {
    if (!m.fileURL) return null;
    const ext = extOf(m.fileName || '');
    if (isImage(m)) {
      return (
        <div className="mchat-file">
          <a href={m.fileURL} target="_blank" rel="noopener noreferrer" title="Abrir imagen">
            <img src={m.fileURL} alt={m.fileName || 'Imagen'} className="mchat-img" />
          </a>
          <div className="mchat-file-actions">
            <span className="mchat-file-ext">{ext}</span>
            <a className="mchat-dl" href={m.fileURL} download={m.fileName} title="Descargar"><Download size={13} /> Descargar</a>
          </div>
        </div>
      );
    }
    return (
      <div className="mchat-file">
        <span className="mchat-file-ext mchat-file-ext-doc">{ext}</span>
        <FileText size={22} className="mchat-file-icon" />
        <div className="mchat-file-meta">
          <b>{m.fileName || 'Archivo'}</b>
          {m.fileSize ? <span>{formatSize(m.fileSize)}</span> : null}
        </div>
        <a className="mchat-dl" href={m.fileURL} target="_blank" rel="noopener noreferrer" download={m.fileName} title="Descargar"><Download size={13} /> Descargar</a>
      </div>
    );
  };

  const renderReplyQuote = (m: Mensaje) => {
    if (!m.replyTo) return null;
    return (
      <div className={`mchat-reply ${m.senderId === user.uid ? 'mine' : ''}`}>
        <Reply size={11} />
        <div>
          <b>{m.replyTo.senderName || 'Mensaje'}</b>
          <p>{m.replyTo.text || 'Archivo adjunto'}</p>
        </div>
      </div>
    );
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
                    <b>{iAmLawyer ? `${requestCounterpartName(r)} busca asesoría` : `Solicitud con ${requestCounterpartName(r)}`}</b>
                    <span>{iAmLawyer ? 'Responder solicitud' : 'Esperando respuesta del abogado'}</span>
                    <small>{new Date(r.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</small>
                  </button>
                );
              })}
              {(() => {
                const activas = conversaciones.filter((c) => c.status !== 'finalizada');
                const finalizadas = conversaciones.filter((c) => c.status === 'finalizada');
                return (
                  <>
                    {activas.length > 0 && <div className="mensajes-group">Asesorías activas</div>}
                    {activas.map((c) => (
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
                    {finalizadas.length > 0 && <div className="mensajes-group">Finalizadas</div>}
                    {finalizadas.map((c) => (
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
                );
              })()}
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
                    <span>{iAmLawyer ? `Solicitud de ${requestCounterpartName(activeRequest)}` : `Solicitud con ${requestCounterpartName(activeRequest)}`}</span>
                  </div>
                  <div className="mensajes-chat-body" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                    <div style={{ maxWidth: 420, padding: 30 }}>
                      <MessageCircle size={40} style={{ color: 'var(--wine)', margin: '0 auto 14px' }} />
                      <b style={{ fontSize: 15, display: 'block', marginBottom: 6 }}>
                        {iAmLawyer ? `${requestCounterpartName(activeRequest)} te ha solicitado una asesoría` : `Solicitud enviada a ${requestCounterpartName(activeRequest)}`}
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
                {pinned.length > 0 && (
                  <div className="mchat-pinnedbar">
                    <Pin size={13} />
                    <b>Anclados</b>
                    {pinned.map((p) => (
                      <span key={p.id} className="mchat-pin-chip">
                        <span className="mchat-pin-text">{p.fileName ? `📎 ${p.fileName}` : p.text}</span>
                        <button onClick={() => void handleTogglePin(p)} aria-label="Desanclar"><PinOff size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
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
                          {m.pinned && <Pin size={11} className="mchat-pin-ind" />}
                        </div>
                        {renderReplyQuote(m)}
                        <div className="mchat-bubble">
                          {renderFile(m)}
                          {m.text && <FormattedText text={m.text} />}
                        </div>
                        <div className="mchat-actions">
                          <button onClick={() => setReplyingTo(m)} title="Responder"><Reply size={12} /> Responder</button>
                          <button onClick={() => void handleTogglePin(m)} title={m.pinned ? 'Desanclar' : 'Anclar'}>
                            {m.pinned ? <PinOff size={12} /> : <Pin size={12} />} {m.pinned ? 'Desanclar' : 'Anclar'}
                          </button>
                        </div>
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
                <>
                  {replyingTo && (
                    <div className="mchat-replybox">
                      <Reply size={13} />
                      <div>
                        <b>Respondiendo a {senderOf(replyingTo).name}</b>
                        <p>{replyingTo.text || replyingTo.fileName || 'Archivo adjunto'}</p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} aria-label="Cancelar respuesta"><X size={14} /></button>
                    </div>
                  )}
                  {uploading && (
                    <div className="mchat-uploadbar">
                      <span>Subiendo archivo… {uploadProgress}%</span>
                      <div><i style={{ width: `${uploadProgress}%` }} /></div>
                    </div>
                  )}
                  <div className="mensajes-composer">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFilePicked}
                    />
                    <button className="mchat-paperclip" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Adjuntar archivo">
                      <Paperclip size={17} />
                    </button>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                      placeholder="Escribe tu consulta…"
                    />
                    <button className="landing-btn primary compact" onClick={handleSend} disabled={sending || uploading || !draft.trim()}>
                      <Send size={15} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {closeModal && active && (
        <div className="dialog-bg" onClick={() => setCloseModal(false)}>
          <div className="lawyer-modal" style={{ maxWidth: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setCloseModal(false)}><X size={18} /></button>
            <div className="lawyer-modal-body">
              <X size={26} style={{ color: 'var(--wine)', margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: 17, marginBottom: 6 }}>¿Finalizar asesoría?</h2>
              <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                Se cerrará el chat con <b>{otherName(active)}</b> y ya no se podrán enviar mensajes.
              </p>
            </div>
            <div className="lawyer-modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button className="landing-btn primary compact" disabled={closing} onClick={confirmClose}>
                <span>{closing ? 'Finalizando…' : 'Finalizar'}</span>
              </button>
              <button className="landing-btn secondary compact" disabled={closing} onClick={() => setCloseModal(false)}>
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
