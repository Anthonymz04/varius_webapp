'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, MoreHorizontal, Plus, Send } from 'lucide-react';

interface Message {
  from: 'ai' | 'user';
  text: string;
}

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: 'Hola. ¿En qué asunto legal puedo orientarte hoy? Estoy especializado en legislación ecuatoriana.' },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    const question = draft.trim();
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
      setMessages([
        ...next,
        { from: 'ai', text: data.message || data.error || 'Ocurrió un error inesperado.' },
      ]);
    } catch {
      setMessages([
        ...next,
        { from: 'ai', text: 'No se pudo conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const suggestions = [
    '¿Cuáles son mis derechos laborales en Ecuador?',
    'Quiero revisar un contrato de arriendo',
    '¿Qué dice el COIP sobre la legítima defensa?',
    'Explica qué es una acción de protección',
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
          onClick={() =>
            setMessages([
              { from: 'ai', text: 'Hola. ¿En qué asunto legal puedo orientarte hoy? Estoy especializado en legislación ecuatoriana.' },
            ])
          }
        >
          <Plus size={18} /> Nueva consulta
        </button>
        <p>RECIENTES</p>
        <button>Contrato de arriendo</button>
        <button>Despido intempestivo</button>
        <button>Derechos del consumidor</button>
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
              <p>Analizando tu consulta…</p>
            </div>
          )}

          <div className="suggestions">
            {suggestions.map((x) => (
              <button key={x} onClick={() => setDraft(x)}>
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
                  send();
                }
              }}
              placeholder="Escribe tu consulta legal..."
            />
            <button disabled={isSending} onClick={send}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
