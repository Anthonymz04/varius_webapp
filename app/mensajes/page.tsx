'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, MessageCircle, Search, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  Conversacion,
  Mensaje,
  fetchConversaciones,
  sendMessage,
  subscribeMessages,
  createRequest,
} from '@/lib/firebase/asesorias';
import { fetchLawyers, Lawyer } from '@/lib/firebase/marketplace';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import FormattedText from '@/app/components/FormattedText';

function ChatInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [lawyerModal, setLawyerModal] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const active = conversaciones.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!user) return;
    let activeFlag = true;
    fetchConversaciones(user.uid).then((list) => {
      if (!activeFlag) return;
      setConversaciones(list);
      const fromUrl = searchParams.get('conversacion');
      if (fromUrl && list.some((c) => c.id === fromUrl)) setActiveId(fromUrl);
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
      fetchConversaciones(user.uid).then((list) => {
        if (!activeFlag) return;
        setConversaciones(list);
        if (activeId && !list.some((c) => c.id === activeId)) {
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

  const otherName = (c: Conversacion) => (c.clientUid === user.uid ? c.lawyerName : c.clientName);

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
    await createRequest({
      clientUid: user.uid,
      clientName: user.displayName || 'Usuario VARIUS',
      clientEmail: user.email ?? '',
      lawyerId: lawyer.id ?? '',
      lawyerUid: (lawyer as Lawyer & { uid?: string }).uid ?? '',
      lawyerName: lawyer.name,
    });
    setLawyerModal(false);
  };

  return (
    <section className="mensajes-page">
      <div className="mensajes-head">
        <Link href="/" className="back">← Volver al inicio</Link>
        <h1>Mis asesorías</h1>
      </div>

      <div className="mensajes-layout">
        <div className="mensajes-list">
          {conversaciones.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#888' }}>
              <MessageCircle size={28} style={{ margin: '0 auto 10px', color: 'var(--wine)' }} />
              <p style={{ margin: 0 }}>Aún no tienes asesorías activas. Solicita una desde el asistente IA o el marketplace.</p>
            </div>
          ) : (
            conversaciones.map((c) => (
              <button
                key={c.id}
                className={`mensaje-item ${c.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(c.id)}
              >
                <b>{otherName(c)}</b>
                <span>{c.lastMessage}</span>
                <small>{new Date(c.lastMessageAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</small>
              </button>
            ))
          )}
          {lawyers.length > 0 && (
            <button className="mensaje-new" onClick={() => setLawyerModal(true)}>
              Buscar un abogado <Search size={14} />
            </button>
          )}
        </div>

        <div className="mensajes-chat">
          {!active ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 13 }}>
              Selecciona una asesoría para ver el chat, o busca un abogado para iniciar una nueva.
            </div>
          ) : (
            <>
              <div className="mensajes-chat-head">
                <span>{otherName(active)}</span>
                {active.clientUid === user.uid && (
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
                  <div key={m.id} className={`mensaje ${m.from === user.uid ? 'user' : 'ai'}`}>
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
              {lawyers.map((l) => (
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