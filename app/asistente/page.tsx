'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bot, MoreHorizontal, Plus, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  Consultation,
  fetchConsultations,
  saveConsultation,
} from '@/lib/firebase/consultations';

interface Message {
  from: 'ai' | 'user';
  text: string;
}

const GREETING: Message = {
  from: 'ai',
  text: 'Hola. ¿En qué asunto legal puedo orientarte hoy? Estoy especializado en legislación ecuatoriana.',
};

function AsistenteChat() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [recent, setRecent] = useState<Consultation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setRecent([]);
      return;
    }
    fetchConsultations(user.uid)
      .then((list) => {
        if (active) setRecent(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const persist = async (msgs: Message[]) => {
    if (!user) return;
    const firstUserMsg = msgs.find((m) => m.from === 'user');
    const title = firstUserMsg ? firstUserMsg.text.slice(0, 60) : 'Consulta';
    try {
      const id = await saveConsultation(user.uid, title, msgs, activeId);
      if (!id) return;
      setActiveId(id);
      setRecent((prev) => {
        const updated: Consultation = { id, uid: user.uid, title, messages: msgs, updatedAt: Date.now() };
        const rest = prev.filter((c) => c.id !== id);
        return [updated, ...rest].slice(0, 20);
      });
    } catch {}
  };

  const openConsultation = (c: Consultation) => {
    if (isSending) return;
    setActiveId(c.id);
    setMessages(c.messages.length ? c.messages : [GREETING]);
  };

  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendPrompt = async (questionText: string) => {
    const question = questionText.trim();
    if (!question || isSending) return;

    const next: Message[] = [...messages, { from: 'user', text: question }];
    setMessages(next);
    setDraft('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({
            role: m.from === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      });
      const data = await response.json();
      const full: Message[] = [
        ...next,
        { from: 'ai', text: data.message || data.error || 'Ocurrió un error inesperado.' },
      ];
      setMessages(full);
      void persist(full);
    } catch {
      const full: Message[] = [
        ...next,
        { from: 'ai', text: 'No se pudo conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.' },
      ];
      setMessages(full);
      void persist(full);
    } finally {
      setIsSending(false);
    }
  };

  const suggestions = [
    '¿Qué indemnización me corresponde por despido intempestivo?',
    '¿Cómo calcular la pensión de alimentos en Ecuador?',
    '¿Cuáles son los requisitos de un contrato de arriendo válido?',
    '¿Qué dice el COIP sobre la legítima defensa?',
  ];

  return (
    <section className="ai-page">
      {/* Sidebar */}
      <aside>
        <Link className="brand" href="/">
          <span>V</span> VARIUS
        </Link>
        <button
          className="new-chat"
          onClick={() => {
            setActiveId(null);
            setMessages([GREETING]);
          }}
        >
          <Plus size={18} /> Nueva consulta
        </button>
        <p>MIS CONSULTAS</p>
        {user ? (
          recent.length ? (
            recent.map((c) => (
              <button
                key={c.id}
                onClick={() => openConsultation(c)}
                className={c.id === activeId ? 'active' : ''}
              >
                {c.title}
              </button>
            ))
          ) : (
            <p className="recent-empty">Tus conversaciones aparecerán aquí.</p>
          )
        ) : (
          <p className="recent-empty">Inicia sesión para guardar tu historial de consultas.</p>
        )}
        <footer>La IA orienta. Los profesionales acompañan.</footer>
      </aside>

      {/* Chat Area */}
      <div className="chat">
        <div className="chat-top">
          <Link className="back mobile-back" href="/">←</Link>
          <div>
            <b>Asistente jurídico</b>
            <span>
              <i /> En línea
            </span>
          </div>
          <button className="icon-btn">
            <MoreHorizontal />
          </button>
        </div>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div className={`message ${m.from}`} key={i}>
              {m.from === 'ai' && (
                <div className="ai-icon">
                  <Bot size={17} />
                </div>
              )}
              <p>{m.text}</p>
            </div>
          ))}

          {isSending && (
            <div className="message ai">
              <div className="ai-icon">
                <Bot size={17} />
              </div>
              <p>Analizando legislación ecuatoriana…</p>
            </div>
          )}

          <div className="suggestions">
            {suggestions.map((x) => (
              <button key={x} onClick={() => handleSendPrompt(x)} disabled={isSending}>
                {x}
              </button>
            ))}
          </div>
        </div>

        <div className="composer">
          <p>
            ⚖️ La información es orientativa, basada en legislación ecuatoriana, y no sustituye
            asesoría profesional.
          </p>
          <div>
            <textarea
              disabled={isSending}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt(draft);
                }
              }}
              placeholder="Escribe tu consulta legal sobre Ecuador..."
            />
            <button disabled={isSending} onClick={() => handleSendPrompt(draft)}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AsistentePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Cargando Asistente IA…</div>}>
      <AsistenteChat />
    </Suspense>
  );
}
