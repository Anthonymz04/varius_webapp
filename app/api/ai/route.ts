import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const inputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(4000),
  })).min(1).max(15),
});

const visits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimit(request: NextRequest) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const now = Date.now();
  const current = visits.get(key);
  if (!current || current.resetAt < now) {
    visits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  if (current.count >= MAX_REQUESTS) return current.resetAt;
  current.count += 1;
  return null;
}

export async function POST(request: NextRequest) {
  const retryAt = rateLimit(request);
  if (retryAt) return NextResponse.json({ error: 'Has alcanzado el límite temporal de consultas.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((retryAt - Date.now()) / 1000)) } });

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'La consulta no tiene un formato válido.' }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'El asistente no está configurado todavía. Añade OPENAI_API_KEY en .env.local.' }, { status: 503 });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: `Eres el asistente jurídico de VARIUS. Responde siempre en español claro, con empatía y estructura breve. Ofreces orientación educativa general, no asesoría profesional ni representación legal. Pide país o jurisdicción cuando sea relevante y no inventes leyes, plazos ni fuentes. No facilites fraude, evasión legal, violencia ni acciones ilegales. Al final de cada respuesta incluye: "Esta respuesta es únicamente orientativa y no sustituye la asesoría profesional."`,
      input: parsed.data.messages.map((message) => ({ role: message.role, content: [{ type: 'input_text' as const, text: message.content }] })),
      max_output_tokens: 700,
    });
    const text = response.output_text?.trim();
    if (!text) throw new Error('Empty response');
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('VARIUS AI request failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'No pudimos procesar tu consulta en este momento. Inténtalo nuevamente.' }, { status: 502 });
  }
}
