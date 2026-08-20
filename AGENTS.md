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
  layout.tsx            # AuthProvider, MobileSplash, Header, Footer, BottomNav
  page.tsx              # LandingPage (sin auth) ↔ Dashboard (logueado, acciones por rol)
  globals.css           # TODO el CSS del proyecto (3000+ líneas)
  asistente/            # Chat IA + historial "Mis consultas" (Firestore)
  abogados/             # Marketplace: abogados de Firestore + solicitud de asesoría
  biblioteca/           # Biblioteca legal
  tutorias/             # Tutorías con reserva de fecha/hora (Firestore)
  comunidad/            # Posts, likes y comentarios reales (Firestore)
  nosotros/             # Nosotros y contacto
  perfil/               # Perfil + mis solicitudes de asesoría + mis reservas
  preguntas-frecuentes/ # FAQ estática
  hooks/useMisSolicitudes.ts  # hook solicitudes+reservas del usuario
  componentes/
    MobileSplash.tsx    # Splash mobile (<700px, no logueado), botón abre AuthDialog
    AuthDialog.tsx      # Modal login/registro (Correo + Google)
    Header.tsx          # Nav desktop con menú usuario
    BottomNav.tsx       # Nav inferior mobile
    HeroCarousel.tsx    # Carrusel hero de landing
    LawyerCard.tsx      # Card de abogado
    Footer.tsx
lib/
  auth-context.tsx      # useAuth() → { user, role, loading, signOut }
  firebase/client.ts    # init Firebase / flag isFirebaseConfigured
  firebase/profile.ts   # users/{uid} (createProfile, UserRole: citizen|student|lawyer)
  firebase/consultations.ts  # colección consultations (historial chat IA)
  firebase/marketplace.ts    # colección lawyers + lawyer_requests (solicitudes)
  firebase/tutorias.ts       # colección tutoria_reservas
  firebase/comunidad.ts      # community_posts + community_comments (seed incluido)
  firebase/seed-data.ts      # datos semilla de abogados, tutorías y posts
middleware.ts           # proxy (convención deprecada en Next 16, no tocar sin migrar)
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
- `bc5ba31` fix(mobile): modal de login sobre el splash (z-index 20→100000)
- `6039455` chore: Next.js 15 → 16.3.1
- `a2847a7` docs: AGENTS.md inicial
- `f1ccd7b` feat(asistente): historial de consultas en Firestore (collections)
- feat: marketplace real (Firestore), tutorías con reserva, comunidad con posts/likes/comentarios, dashboard y perfil por rol

## Pendiente / próximos pasos
- Middleware deprecado en Next 16 (aviso del build); migrar a `proxy.ts` con `npx @next/codemod@canary middleware-to-proxy .`
- Test manual pendiente por el usuario (auth Google requiere dominio autorizado en Firebase Console)
- Secciones "Perfil profesional abogado" (edición) y progreso de estudiante siguen como stub
