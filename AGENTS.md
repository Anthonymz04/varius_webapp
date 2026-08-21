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
```
No hay test suite. No hay comando de typecheck separado (usar `npm run build` que corre tsc).
Nota: el build puede requerir internet SOLO si next/font descarga fuentes por primera vez; después quedan cacheadas.

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
- WhatsApp idea futura mencionada por el usuario para constancia de asesorías
- **Decisión storage (2026-08-20)**: imágenes con Firebase Storage (no Cloudinary); se integra al construir el perfil profesional del abogado (foto + certificaciones en `certifications/{uid}/...`, reglas de privacidad por usuario, estado `lawyers/{id}.verified` para_verificación). Foto de perfil Google usa `photoURL` directo (sin subir nada). Assets de marca van en `/public` + `next/image`.
