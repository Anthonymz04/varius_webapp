import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const inputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(4000),
  })).min(1).max(15),
  stream: z.boolean().optional(),
});

const visits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000;
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 25000);
const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 2000);

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

interface Provider {
  name: string;
  apiKey?: string;
  baseURL: string;
  model: string;
  headers?: Record<string, string>;
  extra?: Record<string, unknown>;
}

const SYSTEM_PROMPT = `Eres el asistente jurídico de VARIUS, especializado en legislación ecuatoriana. Responde SIEMPRE en español, incluso si el usuario escribe en otro idioma. Responde en español claro, con empatía y estructura breve, usando markdown ligero (negritas, listas y encabezados) para organizar la información. Tu marco de referencia principal incluye: Constitución de la República del Ecuador (2008), Código Orgánico Integral Penal (COIP), Código del Trabajo, Código Civil, Código Orgánico General de Procesos (COGEP), Ley Orgánica de Defensa del Consumidor, y demás normativa vigente en Ecuador. Ofreces orientación educativa general, no asesoría profesional ni representación legal. Cuando el usuario pregunte algo, enmárcalo siempre en el contexto del derecho ecuatoriano. No inventes leyes, artículos, plazos ni fuentes. Si no estás seguro de un dato específico, indícalo honestamente. No facilites fraude, evasión legal, violencia ni acciones ilegales. No dejes respuestas incompletas o cortadas a mitad de un párrafo: desarrolla la respuesta completa hasta cerrar el tema. Al final de cada respuesta incluye: "Esta respuesta es únicamente orientativa, basada en legislación ecuatoriana, y no sustituye la asesoría profesional."`;

function buildProviders(): Provider[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://varius-webapp-one.vercel.app';
  const providers: Provider[] = [
    {
      name: 'custom',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.b.ai/v1',
      model: process.env.OPENAI_MODEL || 'deepseek-v4-flash',
      extra: (process.env.OPENAI_BASE_URL || 'https://api.b.ai/v1').includes('b.ai')
        ? { thinking: { type: 'disabled' } }
        : undefined,
    },
    {
      name: 'nvidia-nim',
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
    },
    {
      name: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
      headers: { 'HTTP-Referer': appUrl, 'X-Title': 'VARIUS' },
    },
  ];
  const order = (process.env.AI_PROVIDER_ORDER || 'custom,nvidia-nim,openrouter')
    .split(',')
    .map((s) => s.trim());
  return order
    .map((name) => providers.find((p) => p.name === name))
    .filter((p): p is Provider => Boolean(p && p.apiKey));
}

async function askProvider(p: Provider, messages: { role: string; content: string }[]): Promise<string> {
  const client = new OpenAI({ apiKey: p.apiKey, baseURL: p.baseURL, defaultHeaders: p.headers, timeout: TIMEOUT_MS });
  const params = {
    model: p.model,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    ...(p.extra ?? {}),
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
  const response = await client.chat.completions.create(params);
  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error(`${p.name}: respuesta vacía`);
  return text;
}

async function streamProvider(p: Provider, messages: { role: string; content: string }[]): Promise<ReadableStream<Uint8Array>> {
  const client = new OpenAI({ apiKey: p.apiKey, baseURL: p.baseURL, defaultHeaders: p.headers, timeout: TIMEOUT_MS });
  const params = {
    model: p.model,
    max_tokens: MAX_TOKENS,
    stream: true,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming;
  const stream = await client.chat.completions.create(params);
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function POST(request: NextRequest) {
  const retryAt = rateLimit(request);
  if (retryAt) return NextResponse.json({ error: 'Has alcanzado el límite temporal de consultas.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((retryAt - Date.now()) / 1000)) } });

  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'La consulta no tiene un formato válido.' }, { status: 400 });

  const providers = buildProviders();
  if (providers.length === 0) {
    return NextResponse.json({ error: 'El asistente no está configurado. Define OPENAI_API_KEY, NVIDIA_API_KEY u OPENROUTER_API_KEY en el entorno.' }, { status: 503 });
  }

  const trimmed = parsed.data.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
  let lastError = 'desconocido';

  if (parsed.data.stream) {
    for (const p of providers) {
      try {
        console.log(`[ai] streaming con ${p.name} (${p.model})`);
        const stream = await streamProvider(p, trimmed);
        return new Response(stream, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Provider': p.name, 'X-Model': p.model },
        });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`[ai] ${p.name} falló (stream):`, lastError);
      }
    }
  } else {
    for (const p of providers) {
      try {
        console.log(`[ai] consultando ${p.name} (${p.model})`);
        const text = await askProvider(p, trimmed);
        return NextResponse.json({ message: text, provider: p.name, model: p.model });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`[ai] ${p.name} falló:`, lastError);
      }
    }
  }

  return NextResponse.json({ error: 'No pudimos procesar tu consulta en este momento. Inténtalo nuevamente.' }, { status: 502 });
}
