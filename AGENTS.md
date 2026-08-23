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
- `capacitor.config.ts` usa modo `server.url` (WebView cargando la app desplegada). **ACTUAL**: apunta a `https://desktop-od93sh4.tailc8427e.ts.net:8443` (túnel Tailscale, funciona solo si el teléfono tiene Tailscale conectado). Cuando exista deploy en Vercel, reemplazar por la URL real `https://TU_DOMINIO.vercel.app` (y agregarla a Firebase Authorized Domains).
- Los iconos se generan con `npm run icons` desde `public/icon.svg` (fuente única de la marca):
  - PWA: `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`
  - Splash Android: `android/app/src/main/res/drawable*/splash.png`
  - Launcher Android: `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- Para el logo REAL: reemplazar `public/icon.svg` y correr `npm run icons` (el logo oficial de VARIUS ya está integrado).
- Para generar el APK: instalar Android Studio, luego `npx cap open android` y Build → APK (o `npx cap build android`). También se puede probar en el emulador de Android Studio.
- El splash nativo (color + logo al abrir) lo maneja `@capacitor/splash-screen` (config en capacitor.config.ts). El splash web dentro de la app es `MobileSplash` (solo móvil <700px y sin sesión).
- `MobileSplash` es una máquina de estados con localStorage `varius.onboarded` y flag de módulo `launched`: 1er arranque → bienvenida; siguientes → splash vino ≤1.5s mientras auth carga; al reanudar → `none` (usa `@capacitor/app` appStateChange + visibilitychange).
- Home móvil autenticado (≤700px): header visible (brand + hamburguesa), saludo 24px sin ✦, línea de actividad en texto, tarjeta IA vino (`.dash-ai-card`) con CTA a /asistente, accesos rápidos 4×2 (`.action-grid`/`.action-card` reestilizados, tile "Más" dispara evento `varius:toggle-menu` que abre el `.mobile-nav`), bottom-nav con safe-area. Secciones de desktop (`.two-col`, `.news`, `.site-footer`) ocultas en móvil. La actividad pasó de `.summary-card` a una sección "Tu actividad" en /perfil (`.profile-activity`).

### Probar en el teléfono (procedimiento verificado 2026-08-22)
- **Por LAN**: `npm run build` + `npm start -- -H 0.0.0.0`, abrir `http://IP_PC:3000` en el teléfono (mismo Wi-Fi). Requisitos: (a) red del PC en perfil **Privado** (Configuración → Ethernet → Privada) o regla de firewall `New-NetFirewallRule -DisplayName "VARIUS dev 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -Profile Any`; (b) Google login NO funciona por IP (Firebase no autoriza IPs) — usar correo/contraseña o el túnel.
- **Por túnel Tailscale (Google login funciona)**: activar Serve una vez en `https://login.tailscale.com/f/serve?node=...`, luego `tailscale serve --bg --https=8443 http://localhost:3000`. El teléfono (con Tailscale conectado y "Use Tailscale DNS" activo) abre `https://<maquina>.<tailnet>.ts.net:8443`. Agregar `<maquina>.<tailnet>.ts.net` a Firebase → Authentication → Authorized domains. La URL por IP da `ERR_SSL_PROTOCOL_ERROR` (normal, exige SNI/FQDN).
- **Túnel Cloudflared** (fallback sin Tailscale en el teléfono): `cloudflared tunnel --url http://localhost:3000` → `https://xxx.trycloudflare.com` → agregar a Authorized domains. La URL cambia en cada reinicio.

## Variables de entorno
Archivo `.env.local` (no versionado) con:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```
`lib/firebase/client.ts` expone `isFirebaseConfigured` — la app funciona sin Firebase mostrando el aviso "Firebase no está configurado".

## Estructura
```
app/
  layout.tsx            # AuthProvider, MobileSplash, Header, Footer, BottomNav + next/font
  loading.tsx           # spinner global de transición entre rutas
  page.tsx              # LandingPage (sin auth) ↔ Dashboard (datos reales según rol)
  globals.css           # TODO el CSS del proyecto (3400+ líneas)
  asistente/            # Chat IA + historial "Mis consultas" (Firestore)
  abogados/             # Marketplace: abogados de Firestore + solicitud de asesoría
  biblioteca/           # Biblioteca legal
  tutorias/             # Tutorías con reserva de fecha/hora (Firestore)
  comunidad/            # Posts, likes y comentarios reales (Firestore)
  nosotros/             # Nosotros y contacto
  perfil/               # Perfil editable + solicitudes + reservas + historial de acciones
  preguntas-frecuentes/ # FAQ estática
  hooks/useMisSolicitudes.ts  # hook solicitudes+reservas del usuario
  components/
    NotificationBell.tsx # campanita con notificaciones en tiempo real (Firestore)
    MobileSplash.tsx    # Splash mobile (<700px, no logueado), botón abre AuthDialog
    AuthDialog.tsx      # Login/registro; con Google pide rol la primera vez
    Header.tsx          # Nav desktop con buscador y campanita
    BottomNav.tsx       # Nav inferior mobile
    HeroCarousel.tsx    # Carrusel hero de landing
    LawyerCard.tsx      # Card de abogado
    FormattedText.tsx   # Render markdown ligero del chat (negritas, listas, párrafos)
    Skeleton.tsx        # Placeholder shimmer reutilizable (width/height/radius)
    Footer.tsx
lib/
  auth-context.tsx      # useAuth() → { user, role, loading, signOut, reloadRole }
  firebase/client.ts    # init Firebase / flag isFirebaseConfigured
  firebase/profile.ts   # users/{uid} (createProfile + updateProfileFields)
  firebase/consultations.ts  # colección consultations (historial chat IA)
  firebase/marketplace.ts    # lawyers + lawyer_requests (+notificación/historial/correo)
  firebase/tutorias.ts       # tutoria_reservas (+notificación/historial/correo)
  firebase/comunidad.ts      # community_posts + community_comments (seed incluido)
  firebase/notifications.ts  # notifications, action_history, mail (cola de correos)
  firebase/verification.ts   # lawyer_verifications (solicitud de verificación de abogado)
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
- `lawyer_verifications/{uid}` — { uid, email, fullName, registryNumber, university, yearsExperience, bio, price, status:'pendiente', createdAt }
- Patrón: ordenar en cliente, nunca where+orderBy juntos (evita índices compuestos).

## Convenciones y notas
- Idioma UI: **español**. Sin comentarios en el código (petición explícita del usuario).
- Los modales/overlays usan z-index 100000 (`.auth-overlay`, `.dialog-bg`) — siempre por encima de `.splash-overlay` (99999).
- Mobile-first: breakpoint principal 700px (splash + `header` oculto debajo).
- Roles de usuario: `citizen | student | lawyer` — condicionan acciones del dashboard (actionsByRole en app/page.tsx).
- Toda funcionalidad Firestore debe degradar elegantemente si !db (fallback seed o mensaje), nunca romper la UI.
- Docs de negocio/marca: `varius_documentacion_optimizada.md` (fuente de verdad funcional; mockups listan 10 pantallas objetivo).
- Al terminar un cambio: verificar con `npm run build` (incluye tsc) y proporcionar mensaje de commit descriptivo.

## Git
- Repo: https://github.com/Anthonymz04/varius_webapp
- Rama de trabajo: **`ariel_branch`**
- Push solo con confirmación explícita. Commits pequeños y descriptivos, uno por fix.

## Cambios recientes (historial de decisiones)
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
- **Correos**: plan Spark no envía correos; la cola `mail` queda lista (formato de la extensión Trigger Email). Para activar: migrar a Blaze + instalar extensión "Trigger Email" o Cloud Functions. Decisión del usuario 2026-08-20.
- **Publicar `firestore.rules`** en Firebase Console (colecciones notifications, action_history, mail, lawyer_verifications). Es el fix del toast "No se pudo enviar" aunque la solicitud sí se guarde (los writes secundarios de notificación fallan sin reglas). El CLI local no tiene proyecto/credenciales (`firebase.json` no existe); publicar manualmente desde la consola o `firebase deploy --only firestore:rules`.
- **Panel admin de verificación**: pendiente de construir (app separada `admin.varius.ec` o ruta protegida por custom claim `admin`). El flujo cliente ya queda listo: `lawyer_verifications/{uid}` con status pendiente/aprobada/rechazada. El admin aprobará → escribe `users/{uid}.role='lawyer'` y crea `lawyers/{id}` (perfil marketplace). La seguridad NO depende de que la URL sea secreta sino de la autorización (claim + reglas).
- **Perfil profesional abogado** (edición de bio/precio) sigue como stub; foto + certificaciones con Firebase Storage en `certifications/{uid}/...` al construirlo.
- **Avatar ovalado**: reportado por el usuario, pendiente de revisión visual (CSS parece correcto: width==height + border-radius:50%; sospecha: `<img>` con `height:auto` sin `object-fit:cover`).
- `npm run lint` está ROTO en Next 16 (interpreta "lint" como directorio; no hay config eslint). Usar `npm run build` (incluye tsc) como verificación.
- **Deploy a Vercel**: pendiente (la cuenta del proyecto no es del usuario, es colaborador). Mientras tanto, se prueba con túnel Tailscale (serve --https=8443). Ver "Probar en el teléfono" arriba.
- **APK**: el proyecto Android está generado; para buildear APK: `npx cap open android` → Build → Build APK(s). El server.url apunta al túnel Tailscale.
- WhatsApp idea futura mencionada por el usuario para constancia de asesorías
- **Decisión storage (2026-08-20)**: imágenes con Firebase Storage (no Cloudinary); se integra al construir el perfil profesional del abogado (foto + certificaciones en `certifications/{uid}/...`, reglas de privacidad por usuario, estado `lawyers/{id}.verified` para_verificación). Foto de perfil Google usa `photoURL` directo (sin subir nada). Assets de marca van en `/public` + `next/image`.
