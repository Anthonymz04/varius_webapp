'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bot, MoreHorizontal, Plus, Send } from 'lucide-react';

interface Message {
  from: 'ai' | 'user';
  text: string;
}

function AsistenteChat() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: 'Hola. ¿En qué asunto legal puedo orientarte hoy? Estoy especializado en legislación ecuatoriana.' },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  // If URL has a prompt parameter on load, send it automatically
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
          onClick={() =>
            setMessages([
              { from: 'ai', text: 'Hola. ¿En qué asunto legal puedo orientarte hoy? Estoy especializado en legislación ecuatoriana.' },
            ])
          }
        >
          <Plus size={18} /> Nueva consulta
        </button>
        <p>RECIENTES</p>
        <button onClick={() => handleSendPrompt('Revisar contrato de arriendo')}>Contrato de arriendo</button>
        <button onClick={() => handleSendPrompt('Despido intempestivo derechos')}>Despido intempestivo</button>
        <button onClick={() => handleSendPrompt('Derecho del consumidor Ecuador')}>Derechos del consumidor</button>
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
