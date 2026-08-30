# AGENTS.md — Contexto del proyecto VARIUS WebApp

## Qué es
VARIUS es una plataforma LegalTech para Ecuador: asistente jurídico con IA, directorio de abogados verificados y biblioteca legal. Built con pasión MVP-first.

## Stack
- **Framework**: Next.js 16 (App Router) — `app/` directory
- **React**: 19
- **TypeScript**: strict
- **Auth/Firestore**: Firebase (client-side), `lib/firebase/client.ts`
- **OpenAI**: `openai` v7 para el asistente IA
- **UI**: CSS puro en `app/globals.css` (sin Tailwind ni CSS modules), iconos `lucide-react`, validación `zod`

## Comandos
```bash
npm install
npm run dev      # desarrollo (http://localhost:3000)
npm run build    # build de producción
npm run lint     # eslint de next
npm run icons    # regenera iconos PNG (PWA) + splash e iconos de launcher Android desde public/icon.svg
npm run cap:sync # sincroniza Capacitor con el proyecto Android
```
No hay test suite. No hay comando de typecheck separado (usar `npm run build` que corre tsc).
Nota: el build puede requerir internet SOLO si next/font descarga fuentes por primera vez; después quedan cacheadas.

## App móvil / Capacitor / PWA
- La app es **PWA** (sw.js + manifest) y además está envuelta en **Capacitor** para generar un APK Android real (`android/`, appId `com.varius.app`).
- `capacitor.config.ts` usa modo `server.url` (WebView cargando la app desplegada). **ACTUAL**: `https://varius-webapp-one.vercel.app` (deploy oficial conectado al repo de GitHub por el amigo — auto-deploy al hacer commit en main; el dominio ya está en Firebase Authorized Domains). Si cambia la URL de producción, actualizar aquí + `npm run cap:sync` + rebuild APK.
- Los iconos se generan con `npm run icons` desde `public/icon.svg` (fuente única de la marca):
  - PWA: `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`
  - Splash Android: `android/app/src/main/res/drawable*/splash.png`
  - Launcher Android: `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- Para el logo REAL: reemplazar `public/icon.svg` y correr `npm run icons` (el logo oficial de VARIUS ya está integrado).
- Para generar el APK: instalar Android Studio, luego `npx cap open android` y Build → APK (o `npx cap build android`). También se puede probar en el emulador de Android Studio.
- El splash nativo (color + logo al abrir) lo maneja `@capacitor/splash-screen` (config en capacitor.config.ts). El splash web dentro de la app es `MobileSplash` (solo móvil <700px y sin sesión).
- `MobileSplash` es una máquina de estados con flag de módulo `launched` y localStorage `varius.onboarded` (solo como registro): al abrir la app SIEMPRE sale el splash vino (mín 1.2s / máx 1.5s); si no hay sesión → bienvenida "Comenzar ahora" (que abre el AuthDialog sobre la bienvenida, nunca la landing); si hay sesión → dashboard. Al reanudar → `none` (usa `@capacitor/app` appStateChange + visibilitychange).
- Home móvil autenticado (≤700px): header visible (brand + hamburguesa), saludo 24px sin ✦, línea de actividad en texto, tarjeta IA vino (`.dash-ai-card`) con CTA a /asistente, accesos rápidos 4×2 (`.action-grid`/`.action-card` reestilizados, tile "Más" dispara evento `varius:toggle-menu` que abre el `.mobile-nav`), bottom-nav con safe-area. Secciones de desktop (`.two-col`, `.news`, `.site-footer`) ocultas en móvil. La actividad pasó de `.summary-card` a una sección "Tu actividad" en /perfil (`.profile-activity`).

### Probar en el teléfono (procedimiento verificado 2026-08-22)
- **Por LAN**: `npm run build` + `npm start -- -H 0.0.0.0`, abrir `http://IP_PC:3000` en el teléfono (mismo Wi-Fi). Requisitos: (a) red del PC en perfil **Privado** (Configuración → Ethernet → Privada) o regla de firewall `New-NetFirewallRule -DisplayName "VARIUS dev 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Any`; (b) Google login NO funciona por IP (Firebase no autoriza IPs) — usar correo/contraseña o el túnel.
- **Por túnel Tailscale (Google login funciona)**: activar Serve una vez en `https://login.tailscale.com/f/serve?node=...`, luego `tailscale serve --bg --https=8443 http://localhost:3000`. El teléfono (con Tailscale conectado y "Use Tailscale DNS" activo) abre `https://<maquina>.<tailnet>.ts.net:8443`. Agregar `<maquina>.<tailnet>.ts.net` a Firebase → Authentication → Authorized domains. La URL por IP da `ERR_SSL_PROTOCOL_ERROR` (normal, exige SNI/FQDN).
- **Túnel Cloudflared** (fallback sin Tailscale en el teléfono): `cloudflared tunnel --url http://localhost:3000` → `https://xxx.trycloudflare.com` → agregar a Authorized domains. La URL cambia en cada reinicio.

## Despliegue / Producción (Vercel)
- **URL oficial**: `https://varius-webapp-one.vercel.app` — deploy del amigo conectado al repo de GitHub (`Anthonymz04/varius_webapp`), **auto-deploy en cada commit a `main`**.
- **Proyecto personal (transitorio)**: `vercel.com/ariels-projects-daba0557/varius-webapp` — creado con la CLI de Vercel desde la terminal (`vercel --prod`) mientras no había acceso al proyecto oficial; quedó en `https://varius-webapp.vercel.app`. Ya reemplazado por el oficial; se puede borrar en Settings → Danger Zone → Delete Project (no afecta al repo ni al APK).
- **Variables de entorno en Vercel**: `NEXT_PUBLIC_FIREBASE_*` + `OPENAI_API_KEY` (+ `OPENAI_MODEL`). La CLI de Vercel las importa automáticamente desde `.env.local`; en el proyecto del amigo deben estar configuradas a mano.
- **Firebase Authorized Domains**: `varius-webapp-one.vercel.app` (oficial) y `varius-webapp.vercel.app` (antiguo) — requerido para Google login en web y APK.
- **Historial del deploy (2026-08-27)**: 1) deploy temporal vía CLI de Vercel (`vercel --prod`) en la cuenta personal (importa `.env.local` solo); 2) merge de `ariel_branch` → `main` (fast-forward); 3) el amigo conecta el repo a Vercel con auto-deploy; 4) `server.url` del APK pasa a apuntar al dominio oficial.
- **Nota Google login dentro del APK**: Google bloquea OAuth en WebViews embebidas — dentro del APK funciona el login por correo/contraseña; para Google dentro del APK haría falta integrar `@capacitor/browser` (pendiente). En la versión web el login de Google funciona normal.

## Variables de entorno
Archivo `.env.local` (no versionado) con:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=        # key de B.AI (sk-...)
OPENAI_BASE_URL=       # https://api.b.ai/v1 (default si se omite)
OPENAI_MODEL=          # deepseek-v4-flash (default si se omite)
```
`lib/firebase/client.ts` expone `isFirebaseConfigured` — la app funciona sin Firebase mostrando el aviso "Firebase no está configurado".
- **AI / chatbot**: usa el SDK de OpenAI apuntando a B.AI (OpenAI-compatible) en `app/api/ai/route.ts`. `baseURL` = `OPENAI_BASE_URL` o `https://api.b.ai/v1`; modelo = `OPENAI_MODEL` o `deepseek-v4-flash`. Si el modelo devuelve solo `reasoning_content` (modo thinking), se usa como fallback.

## Estructura
```
app/
  layout.tsx            # AuthProvider, MobileSplash, Header, Footer, BottomNav + next/font
  loading.tsx           # spinner global de transición entre rutas
  page.tsx              # LandingPage (sin auth) ↔ Dashboard (datos reales según rol)
  globals.css           # TODO el CSS del proyecto (3400+ líneas)
  asistente/            # Chat IA + historial "Mis consultas" (Firestore)
  abogados/             # Marketplace: abogados de Firestore + solicitud de asesoría
  asesoria/             # (creado) Botón en asistente + panel abogado + chat persistente
  mensajes/             # (creado) Página de asesorías activas + chat 1:1 con el abogado
  biblioteca/           # Biblioteca legal
  tutorias/             # Tutorías con reserva de fecha/hora (Firestore)
  comunidad/            # Posts, likes y comentarios reales (Firestore)
  nosotros/             # Nosotros y contacto
  admin/                # (creado) Panel de administración: aprueba/rechaza verificaciones (rol 'admin')
  perfil/               # Perfil editable (ciudad/bio/portada/avatar) + verificación cédula+PDF + peticiones abogado
  preguntas-frecuentes/ # FAQ estática
  hooks/useMisSolicitudes.ts  # hook solicitudes+reservas del usuario
  components/
    NotificationBell.tsx # campanita con notificaciones en tiempo real (Firestore)
    MobileSplash.tsx    # Splash mobile (<700px, no logueado), botón abre AuthDialog
    AuthDialog.tsx      # Login/registro por correo/contraseña (Google ELIMINADO)
    Header.tsx          # Nav desktop con buscador y campanita
    BottomNav.tsx       # Nav inferior mobile (Asesorías reemplaza Comunidad)
    HeroCarousel.tsx    # Carrusel hero de landing
    LawyerCard.tsx      # Card de abogado
    FormattedText.tsx   # Render markdown ligero del chat (negritas, listas, párrafos)
    Skeleton.tsx        # Placeholder shimmer reutilizable (width/height/radius)
    Footer.tsx
lib/
  auth-context.tsx      # useAuth() → { user, role, loading, signOut, reloadRole }
  firebase/client.ts    # init Firebase / flag isFirebaseConfigured / storage
  firebase/profile.ts   # users/{uid} (createProfile, updateProfileFields, fetchUserProfile)
  firebase/uploads.ts   # (creado) subidas a Storage: cover, avatar, certificado PDF
  firebase/consultations.ts  # colección consultations (historial chat IA)
  firebase/marketplace.ts    # lawyers + lawyer_requests (sin correo; notif+historial)
  firebase/tutorias.ts       # tutoria_reservas (sin correo; notif+historial)
  firebase/asesorias.ts      # (creado) peticiones asesoría + conversaciones + mensajes
  firebase/comunidad.ts      # community_posts + community_comments (seed incluido)
  firebase/notifications.ts  # notifications, action_history (mail retirado del flujo)
  firebase/verification.ts   # lawyer_verifications (cédula + certificadoURL PDF)
  firebase/seed-data.ts      # datos semilla de abogados, tutorías y posts
proxy.ts                # headers de seguridad (antes middleware.ts)
public/sw.js, manifest.webmanifest  # PWA
public/icons/           # iconos PNG generados (192/512/maskable/apple-touch)
scripts/
  generate-icons.mjs    # genera iconos PNG a partir de public/icon.svg (requiere sharp)
  generate-splash.mjs   # pinta los splash.png de Android con el icono de marca
  generate-launcher.mjs # pinta ic_launcher de Android (mipmap) con el icono de marca
capacitor.config.ts     # Config Capacitor: appId com.varius.app, server.url, splash
android/                # Proyecto Android generado por Capacitor (para build APK)
out/                    # Placeholder de assets web para Capacitor (modo server.url)
```

## Colecciones Firestore
- `users/{uid}` — { name, email, photoURL, role, timestamps }
- `consultations/{id}` — { uid, title, messages[], updatedAt, createdAt }
- `lawyers/{id}` — catálogo; si vacía o sin Firebase → fallback a SEED_LAWYERS
- `lawyer_requests/{id}` — { uid, lawyerId, lawyerName, status:'pendiente', createdAt }
- `tutoria_reservas/{id}` — { uid, tutoriaId, tutoriaTitle, fecha, hora, createdAt }
- `community_posts/{id}` — { author, authorUid, body, tags, likedBy[], likeCount, commentCount }
- `community_comments/{id}` — { postId, author, body, createdAt }
- `lawyer_verifications/{uid}` — { uid, email, fullName, registryNumber, university, yearsExperience, bio, price, cedula, certificadoURL, status:'pendiente', createdAt }
- `lawyer_requests/{id}` — petición de asesoría: { clientUid, clientName, clientEmail, lawyerId, lawyerUid, lawyerName, topic, status:'pendiente'|'aceptada'|'rechazada'|'cancelada', conversacionId }
- `conversaciones/{id}` — chat persistente: { participants:[clientUid,lawyerUid], clientUid, clientName, lawyerUid, lawyerName, lastMessage, lastMessageAt, createdAt } + subcolección `messages/{msg}` { from, text, createdAt }
- Patrón: ordenar en cliente, nunca where+orderBy juntos (evita índices compuestos).

## Convenciones y notas
- Idioma UI: **español**. Sin comentarios en el código (petición explícita del usuario).
- Los modales/overlays usan z-index 100000 (`.auth-overlay`, `.dialog-bg`) — siempre por encima de `.splash-overlay` (99999).
- Mobile-first: breakpoint principal 700px (splash + `header` con brand y hamburguesa + menú con cerrar sesión; bottom-nav fija con safe-area).
- Roles de usuario: `citizen | student | lawyer` — condicionan acciones del dashboard (actionsByRole en app/page.tsx).
- Toda funcionalidad Firestore debe degradar elegantemente si !db (fallback seed o mensaje), nunca romper la UI.
- Docs de negocio/marca: `varius_documentacion_optimizada.md` (fuente de verdad funcional; mockups listan 10 pantallas objetivo).
- Al terminar un cambio: verificar con `npm run build` (incluye tsc) y proporcionar mensaje de commit descriptivo.

## Git
- Repo: https://github.com/Anthonymz04/varius_webapp
- Rama de trabajo: **`ariel_branch`** (se trabaja SIEMPRE aquí).
- **Producción**: `main` es la rama que despliega Vercel automáticamente (conectada por el amigo).
- Push solo con confirmación explícita. Commits pequeños y descriptivos, uno por fix.
- **Flujo para actualizar producción**:
  1. `git checkout main`
  2. `git merge ariel_branch` (fast-forward; `main` siempre es ancestro de `ariel_branch`)
  3. `git push origin main` → Vercel se despliega solo
  4. `git checkout ariel_branch`

## Cambios recientes (historial de decisiones)
- feat(admin): panel de administración en `/admin` — aprueba/rechaza verificaciones de abogado (rol 'admin'), al aprobar crea `lawyers/{uid}` y cambia el rol
- feat(asesorías): módulo de asesorías — peticiones del chat/marketplace con aceptar/rechazar del abogado (panel en /perfil), chat persistente 1:1 en /mensajes (conversations + subcolección messages, onSnapshot), botón "Buscar otro abogado", notif+historial; se retiró la cola de correos
- feat(perfil+storage): perfil editable con ciudad/bio, foto de portada y avatar (uploads.ts → covers/{uid}, avatars/{uid}); verificación de abogado con cédula + título PDF (certifications/{uid}/titulo.pdf) visible en el perfil
- feat(storage): Firebase Storage inicializado en client.ts
- chore(auth): retirado el login de Google (problemas en WebView) — solo correo/contraseña; se desinstaló `@capgo/capacitor-social-login`
- feat(despliegue): producción en Vercel — deploy temporal vía CLI, luego merge a `main` y auto-deploy oficial del amigo en `https://varius-webapp-one.vercel.app`; `server.url` del APK actualizado al dominio oficial; merge de `ariel_branch` → `main` (fast-forward)
- fix(logout/splash): cerrar sesión vuelve a la bienvenida; splash SIEMPRE al abrir (mín 1.2s), bienvenida sobre el AuthDialog sin mostrar la landing; invitados ven bienvenida en cada apertura
- feat(rediseño móvil): home autenticado mobile-first (header visible, saludo compacto, tarjeta IA vino, accesos 4×2 por rol, "Más" abre menú, bottom-nav safe-area, splash de arranque con welcome/splash/none, footer oculto en móvil, cerrar sesión en menú y perfil, toggle contraseña, error de cuenta Google al loguear por email)
- feat(pwa+capa): logo de marca (V wine + dorado), iconos PNG PWA (192/512/maskable/apple), manifest con background_color wine (splash de instalación), Capacitor instalado con proyecto `android/` (com.varius.app), splash y launcher Android pintados con la marca, scripts `npm run icons` / `npm run cap:sync`
- fix(chat): scroll con min-height:0 + auto-scroll, banner "Guardar en historial" para conversaciones sin sesión, respuestas con FormattedText (markdown ligero: negritas/listas/párrafos)
- feat(skeletons): componente Skeleton (shimmer) aplicado a abogados, comunidad, perfil y loading.tsx global
- feat(verificación): cambiar rol a abogado ya NO es directo — abre modal de verificación → `lawyer_verifications/{uid}` (status 'pendiente'), rol cambia solo con aprobación de admin. Estudiante ahora pide universidad/carrera (users/{uid}.university/.career)
- `bc5ba31` fix(mobile): modal de login sobre el splash (z-index 20→100000)
- `6039455` chore: Next.js 15 → 16.3.1
- `a2847a7` docs: AGENTS.md inicial
- `f1ccd7b` feat(asistente): historial de consultas en Firestore (collections)
- feat: marketplace real (Firestore), tutorías con reserva, comunidad con posts/likes/comentarios, dashboard y perfil por rol
- `3ffa4cb` chore: middleware.ts → proxy.ts (convención nueva de Next 16)
- feat: notificaciones (campanita en tiempo real) + historial permanente de acciones + cola de correos en `mail`
- feat: perfil editable (nombre/rol), selección de rol en primer Google login, redirección a inicio al cerrar sesión
- feat: dashboard con datos reales (contadores de actividad) y ancho centrado como la landing
- fix(ia): asistente usa chat.completions en vez de la Responses API (400 con la key actual)
- perf: fuentes migradas de @import CSS a next/font + loading.tsx global

## Pendiente / próximos pasos
- Test manual pendiente por el usuario
- **Publicar `firestore.rules`** en Firebase Console (colecciones notifications, action_history, lawyer_verifications, lawyer_requests, conversaciones, messages). Es el fix del toast "No se pudo enviar" aunque la solicitud sí se guarde y de la campanita vacía. El CLI local no tiene proyecto/credenciales (`firebase.json` no existe); publicar manualmente desde la consola o `firebase deploy --only firestore:rules`.
- **OPENAI_API_KEY en Vercel del amigo**: el chatbot falla en producción porque el deploy del amigo no tiene la key (el código de `app/api/ai` es correcto; local funciona con `.env.local`). El amigo debe agregar `OPENAI_API_KEY` (y `OPENAI_MODEL`) a las env vars de su proyecto Vercel.
- **Panel admin de verificación**: CONSTRUIDO en `/admin` (rol `users/{uid}.role='admin'`). Lista las `lawyer_verifications` pendientes (cédula + título PDF + hoja de vida PDF opcional + campos) y Aprueba/Rechaza. Al aprobar: escribe `users/{uid}.role='lawyer'` + cédula + certificateURL + cvURL y crea `lawyers/{uid}` (perfil marketplace con `uid`). El rol `admin` se asigna manualmente en la consola (no auto-promovible). El registro de abogado (AuthDialog) pide cédula + título PDF obligatorio + CV opcional y crea la verificación pendiente; el usuario queda como ciudadano hasta aprobación.
- **Reglas Firestore (seguridad)**: `users` no permite auto-promoverse a 'lawyer' (solo admin o cambiar a citizen/student); `isAdmin()` puede escribir en users/lawyers/lawyer_verifications/notifications/actionHistory. Publicar el `firestore.rules` del repo.
- **Correos**: retirados del flujo (decisión 2026-08-27). La cola `mail` sigue en reglas pero ya no se escribe desde la app.
- **Perfil profesional abogado** (edición de bio/precio) sigue como stub; se editará con el admin.
- **Avatar ovalado**: reportado por el usuario, pendiente de revisión visual (CSS parece correcto: width==height + border-radius:50%; sospecha: `<img>` con `height:auto` sin `object-fit:cover`).
- `npm run lint` está ROTO en Next 16 (interpreta "lint" como directorio; no hay config eslint). Usar `npm run build` (incluye tsc) como verificación.
- **APK**: buildear con `npx cap open android` → Build → Build APK(s), o `cd android && .\gradlew.bat assembleDebug --no-daemon`. `server.url` apunta a `https://varius-webapp-one.vercel.app`.
- WhatsApp idea futura mencionada por el usuario para constancia de asesorías
- **Decisión storage (2026-08-20)**: imágenes con Firebase Storage (ya integrado en uploads.ts: covers/{uid}, avatars/{uid}, certifications/{uid}/titulo.pdf). Foto de perfil Google usa `photoURL` directo. Assets de marca van en `/public` + `next/image`.
