# PLAN POR ETAPAS — VARIUS (Firebase nuevo + marca + legal + planes + IA)

Sesión: 2026-09-16 · Rama: `ariel_branch`
Decisiones del usuario: guía paso a paso de Firebase · empezar de cero (sin migrar datos) ·
planes solo visuales · IA multi-proveedor (OpenRouter + NVIDIA NIM) · vectorizar logo desde los JPEG ·
4 páginas legales (Privacidad, Términos, Cookies, Aviso legal).

---

## Estado de partida (verificado)

| Punto | Hallazgo |
|---|---|
| `node_modules/` | **No existe** → `npm install` obligatorio antes de cualquier build |
| `.env.local` | **No existe** (gitignoreado) → no hay Firebase ni IA en local |
| `public/icon.svg` | 1.27 MB, embebe un **PNG base64 de 1254×1254** → es asset raster disfrazado de SVG |
| Marca integrada | Logo **antiguo** (monograma "AX" rosa/durazno) |
| Marca nueva | JPEG: terracota ≈ `#B45935` sobre crema `#FDF8F5`, isotipo "V + balanza", wordmark "VARIUS / ASESORÍA JURÍDICA" |
| Colores en código | `--wine: #c2185b` (≈60 usos) + hardcodes: `#8c1044`, `#b41450`, `#c9a227`, `#d8ad96`, `#fdf1f6`, sombras `#c2185b0b/30/10` |
| Colores fuera de CSS | `app/layout.tsx` themeColor, `manifest.webmanifest`, `capacitor.config.ts`, `scripts/generate-splash.mjs` |
| Reglas Firestore | Cubren las colecciones reales, pero hay bloques legacy muertos: `posts` (usa `authorId`, el código usa `community_posts.authorUid`), `bookings`, `mail` |
| Colecciones reales | `users`, `lawyers`, `consultationRequests`, `conversations` + `messages`, `notifications`, `actionHistory`, `lawyer_verifications`, `consultations`, `community_posts`, `community_comments`, `tutoria_reservas` |
| Conexión | `npm ping` OK → se puede instalar tooling de vectorización |

---

## ETAPA 0 — Preparación del entorno

1. `npm install` (reinstala deps; el repo no tiene `node_modules`).
2. Baseline: `npm run build` para confirmar que el estado actual compila antes de tocar nada.
3. Nota: el primer build puede requerir internet por `next/font` (queda cacheado después).
4. Anotar el resultado del baseline (si ya falla, arreglarlo ANTES de sumar cambios).

**Salida:** entorno reproducible + baseline conocido.

---

## ETAPA 1 — Firebase nuevo (guía paso a paso, sin tocar código)

El código NO cambia: `lib/firebase/client.ts` ya lee las 6 variables `NEXT_PUBLIC_FIREBASE_*`.

### 1.1 Checklist en Firebase Console (lo ejecuta el usuario)
1. Crear cuenta/proyecto nuevo en https://console.firebase.google.com (correo nuevo).
2. **Authentication → Sign-in method → Correo electrónico/contraseña: habilitar.**
   (Google NO se usa: se retiró por problemas en WebView.)
3. **Firestore Database → Crear base de datos** (modo producción, región `us-central1` o
   `southamerica-east1`; anotar la elegida).
4. **Storage → Comenzar** (requerido: `isFirebaseConfigured` exige `storageBucket`).
5. **Configuración del proyecto → Tus apps → Web (`</>`)** → registrar app `VARIUS Web`.
6. Copiar los 6 valores del objeto `firebaseConfig`.
7. **Authentication → Settings → Dominios autorizados**: agregar
   `localhost`, `varius-webapp-one.vercel.app`, el dominio del APK y el túnel de pruebas.
8. **Reglas**: publicar `firestore.rules` y `storage.rules` (ver 1.3).

### 1.2 `.env.local` (local) y variables en Vercel (producción)
Crear `.env.local` desde `.env.example` con los 6 `NEXT_PUBLIC_FIREBASE_*` + `OPENAI_*` (Etapa 5).
En Vercel del proyecto del amigo: cargar las mismas variables (las `NEXT_PUBLIC_*` se inlinean en build
→ **hay que redeployar** tras cambiarlas).

### 1.3 Saneamiento de reglas (incluido en esta etapa)
- Eliminar bloques legacy muertos: `posts`, `bookings`, `mail` (verificado: el código no los escribe;
  `mail` quedó retirado del flujo).
- Mantener `consultationRequests` con `clientId`/`lawyerId` y `conversations` con `participantIds`
  (coinciden con `lib/firebase/asesorias.ts`).
- Documentar en `docs/firebase-setup.md` el orden real de colecciones y campos.
- Añadir colección nueva si la Etapa 4 la necesita (no es el caso con planes solo visuales).

### 1.4 Documento de setup
Reescribir `docs/firebase-setup.md` como guía verificable paso a paso, con la lista de colecciones,
campos e índices que la app necesita (recordar: el código ordena en cliente y nunca combina
`where` + `orderBy`).

**Salida:** app operativa con el proyecto nuevo; sin cambios de código.

---

## ETAPA 2 — Marca: logo vectorial + cambio de colores

### 2.1 Vectorizar los JPEG (sin perder calidad)
El isotipo es plano y de 2 colores → vectoriza bien. Plan:
- Aislar el isotipo: umbral/limpieza de los JPEG con ImageMagick (`magick`, disponible en el equipo).
- Trazar a SVG con `potrace`/`imagetracerjs` (instalar como `devDependency`; `npm ping` OK).
- Entregables en `public/brand/`:
  - `isotipo.svg` — la "V + balanza" sola (para favicon/iconos/splash/avatar de marca).
  - `lockup.svg` — isotipo + "VARIUS" + "ASESORÍA JURÍDICA" (para header, footer, splash).
  - `isotipo-mono.svg` — versión a un color (para fondos de color).
- Sustituir el `public/icon.svg` actual (1.27 MB raster) por el `isotipo.svg` limpio.

### 2.2 Tokens de color (nuevos valores, mínima rotura)
En `app/globals.css`:
```css
--brand:       #B45935;  /* terracota del logo */
--brand-dark:  #8F4522;  /* hover / texto sobre claro */
--brand-tint:  #F7E4DA;  /* fondos suaves */
--cream:       #FDF8F5;  /* fondo de marca */
--sand:        #E3B6A2;  /* apoyo (avatares, bordes) */
```
Estrategia anti-rotura: mantener el alias `--wine: var(--brand)` y `--gold: var(--brand-dark)` para que
los ~60 usos de `var(--wine)` sigan funcionando sin editar 3400 líneas, y corregir aparte los
**hardcodes** (`#8c1044`, `#b41450`, `#c9a227`, `#d8ad96`, `#c2185b0b/30/10`, `#fdf1f6`).
*(Alternativa más limpia: renombrar `--wine` → `--brand` en todo el CSS. Decidir con el usuario.)*

### 2.3 Propagación fuera del CSS
- `app/layout.tsx` → `viewport.themeColor`, metadata/icons.
- `public/manifest.webmanifest` → `theme_color`, `background_color`, iconos.
- `capacitor.config.ts` → `SplashScreen.backgroundColor`.
- `scripts/generate-splash.mjs` → color de fondo del splash nativo.
- `scripts/generate-icons.mjs` / `generate-launcher.mjs` → leer los SVG nuevos de `public/brand/`.
- `public/sw.js` → subir `CACHE` (`varius-v4` → `varius-v5`) para invalidar iconos cacheados.

### 2.4 Aplicar el lockup nuevo
- `Header.tsx:84` y `asistente/page.tsx` usan `/icons/icon-192.png` en 28px → usar `isotipo.svg` inline
  o `<Image>` con el asset nuevo (evita el cuadrado de fondo en el header).
- `Footer.tsx` (bloque `.footer-logo` con `<span>V</span> VARIUS`) → `lockup.svg`.
- `MobileSplash.tsx:113,125` (`/splash-logo.png`) → regenerado con el isotipo nuevo.
- Iconos PWA + splash Android + launcher → `npm run icons`.

**Salida:** marca nueva aplicada en web, PWA y APK, con SVG vectorial en el repo.

---

## ETAPA 3 — Legal: Privacidad, Términos, Cookies y Aviso legal

### 3.1 Páginas nuevas (App Router, español)
- `app/privacidad/page.tsx` — Política de Privacidad (enfocada en **LOPDP de Ecuador**:
  base legal, finalidades, categorías de datos, plazos, derechos ARCO, contacto del responsable).
- `app/terminos/page.tsx` — Términos y Condiciones (naturaleza del servicio, **la IA orienta y no
  sustituye asesoría profesional**, responsabilidad, conducta, propiedad intelectual, ley aplicable,
  procedimiento de baja).
- `app/cookies/page.tsx` — Política de Cookies (qué se usa: `localStorage varius.onboarded`,
  service worker, Firebase Auth; sin publicidad de terceros).
- `app/aviso-legal/page.tsx` — Aviso legal / identificación del titular.
- Estilo: reutilizar `faq-page` + `profile-section` (patrón de `app/nosotros/page.tsx`) y `.legal-page`
  nuevo en `globals.css` con índice lateral en desktop.

### 3.2 Enganches en la UI
- `Footer.tsx`: columna "Información" + fila inferior con los 4 enlaces legales.
- Aviso de "última actualización" y disclaimer de IA reforzado en `/asistente` y `/planes`.
- (Opcional, a confirmar) banner de consentimiento de cookies mínimo con `localStorage`.

### 3.3 Datos que necesito del usuario
Razón social / nombre titular, RUC, domicilio, correo de contacto, correo de protección de datos.
Mientras no existan, se usan marcadores `[COMPLETAR]` visibles para que no se publiquen por error.
Validación final del texto: **abogado del usuario** (los borradores son base técnica, no dictamen).

**Salida:** 4 páginas legales enlazadas desde el footer.

---

## ETAPA 4 — Planes de suscripción (solo visual)

### 4.1 Página `/planes`
- 3–4 tarjetas con precio, beneficios y CTA. Propuesta de estructura alineada a los roles:
  - **Gratis (Explora)** — IA orientativa, biblioteca, comunidad, perfil.
  - **Estudiante** — IA ampliada, tutorías, guías de estudio.
  - **Profesional** — perfil destacado en el marketplace, asesorías, IA avanzada.
  - **Despacho / Corporativo** — "Contáctanos" (sin precio).
- CTA sin pasarela: WhatsApp + `mailto:contacto@varius.legal` (decisión del usuario: sin cobros).
- Badge "Recomendado", tabla comparativa en desktop y acordeón/tarjetas apiladas en móvil.
- Deja explícito que los precios son **referenciales** hasta activar el cobro.

### 4.2 Enganches
- Sección de planes en la landing (`app/page.tsx`) tras "¿Por qué VARIUS?".
- Enlaces: `Footer` (columna Plataforma), `configuracion/page.tsx` (sección VARIUS) y `Header` nav.
- FAQ de la landing: ajustar la respuesta de "¿Es gratis?" para que sea coherente con los planes.

### 4.3 Preparado para el futuro (sin implementar)
Dejar el componente de planes en un solo archivo de datos (`app/planes/planes.ts`) para que, cuando se
quiera cobrar, solo se cambie la fuente (Firestore) y se añada la pasarela.

**Salida:** página de planes + sección en landing, sin pasarela ni límites reales.

---

## ETAPA 5 — IA multi-proveedor y optimización

### 5.1 Rediseño de `app/api/ai/route.ts`
- **Cadena de proveedores con failover** (todos OpenAI-compatible, se usa el SDK `openai` existente):
  1. `NVIDIA_NIM` — `https://integrate.api.nvidia.com/v1`
  2. `OPENROUTER` — `https://openrouter.ai/api/v1`
  3. `B_AI` — `https://api.b.ai/v1` (actual, como respaldo)
- Config por env: `AI_<PROVIDER>_KEY`, `AI_<PROVIDER>_MODEL`, `AI_<PROVIDER>_BASE_URL`,
  `AI_PROVIDER_ORDER`. Sin tocar `.env.example` más de lo necesario y **sin exponer keys** al cliente.
- **Optimización real** (esto es lo que hoy falta):
  - *Streaming* por `ReadableStream` + consumo incremental en `/asistente` (respuesta percibida más
    rápida y sin esperar el texto completo).
  - `timeout` por intento (AbortController) y failover automático al siguiente proveedor.
  - Recorte del system prompt (hoy ~1.300 caracteres) manteniendo el marco legal ecuatoriano y el
    disclaimer obligatorio.
  - Límite de historial enviado (ventana de N mensajes) y `max_tokens` ajustado por proveedor.
  - Rate limit actual (Map en memoria) → mantener y documentar que en serverless no es persistente
    entre instancias.
  - Cabeceras requeridas por OpenRouter (`HTTP-Referer`, `X-Title`).
  - Logs de proveedor/duración para diagnóstico; mensaje de error único al usuario.
- Mantener el contrato actual (`POST /api/ai` con `{ messages }`) para no romper `/asistente`.

### 5.2 Datos que necesito del usuario
Keys y modelos exactos disponibles en OpenRouter y NVIDIA NIM (y si se conserva o se retira la key de
B.AI). Los nombres de modelo se ponen en env, no en código.

**Salida:** asistente con failover entre 2–3 proveedores, streaming y consumo más eficiente.

---

## ETAPA 6 — Verificación y cierre

1. `npm install` + `npm run build` (incluye `tsc`; `npm run lint` está roto en Next 16, no usarlo).
2. Smoke test en `npm run dev`: login/registro nuevo, consulta IA, guardado de historial, marketplace,
   asesorías + chat, legal pages, `/planes`.
3. Probar degradación sin Firebase (debe mostrar el aviso, no romper).
4. `npm run icons` + `npx cap sync android` → rebuild del APK y verificación de splash/launcher.
5. Actualizar `AGENTS.md` (marca nueva, colecciones, variables de IA, páginas legales y planes).
6. Commit(s) pequeños y descriptivos por etapa en `ariel_branch`. **Nada de push/merge a `main` sin
   confirmación explícita.**

---

## Orden y dependencias

```
Etapa 0 (entorno)
  └─ Etapa 1 (Firebase)  ← bloquea probar todo lo demás
  └─ Etapa 2 (marca)     ← bloquea iconos/splash/APK
       └─ Etapa 3 (legal)
       └─ Etapa 4 (planes)
  └─ Etapa 5 (IA)        ← independiente, requiere keys
       └─ Etapa 6 (verificación + APK + AGENTS.md)
```

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Trazado del logo con ruido/serif sucio | Comparar `isotipo.svg` renderizado vs JPEG a 512px antes de propagar |
| `--wine` en 60+ lugares | Alias temporal + auditoría de hardcodes + revisión visual página por página |
| Build sin `node_modules` | `npm install` en Etapa 0 |
| Textos legales publicados sin revisar | Marcadores `[COMPLETAR]` + revisión de abogado antes de publicar |
| Streaming rompe el guardado del historial | Persistir el texto acumulado al cerrar el stream (mismo `persist()` actual) |
| Cambiar `NEXT_PUBLIC_*` no surte efecto | Redeploy obligatorio en Vercel tras actualizar variables |

## Pendientes de decisión (antes de la Etapa 2/4/5)

1. **Splash**: fondo terracota (`#B45935`) con isotipo crema, o fondo crema con isotipo terracota.
2. **`--wine`**: dejar alias (mínimo riesgo) o renombrar a `--brand` en todo el CSS (más limpio).
3. **Planes**: nombres, precios y beneficios definitivos (o apruebo la propuesta y se ajusta después).
4. **IA**: keys/modelos de OpenRouter y NVIDIA NIM; ¿se retira B.AI?
5. **Legal**: datos del titular (razón social, RUC, domicilio, correos).
6. **Cookies**: ¿banner de consentimiento o solo la página?