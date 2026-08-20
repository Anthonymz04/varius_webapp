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
  page.tsx              # LandingPage (sin auth) ↔ Dashboard (logueado)
  globals.css           # TODO el CSS del proyecto (2900+ líneas)
  asistente/            # Chat IA
  abogados/             # Directorio con búsqueda
  biblioteca/           # Biblioteca legal
  tutorias/             # Tutorías
  comunidad/            # Comunidad y noticias
  nosotros/             # Nosotros y contacto
  perfil/               # Perfil de usuario
  componentes/
    MobileSplash.tsx    # Splash mobile (<700px, no logueado), botón abre AuthDialog
    AuthDialog.tsx      # Modal login/registro (Correo + Google)
    Header.tsx          # Nav desktop con menú usuario
    BottomNav.tsx       # Nav inferior mobile
    HeroCarousel.tsx    # Carrusel hero de landing
    LawyerCard.tsx      # Card de abogado
    Footer.tsx
lib/
  auth-context.tsx      # useAuth() — onAuthStateChanged + perfil Firestore
  firebase/client.ts    # init Firebase / flags
  firebase/profile.ts   # doc usuarios/{uid} (createProfile, UserRole: citizen|student|lawyer)
public/
  sw.js                 # Service Worker PWA
  manifest.webmanifest
```

## Convenciones y notas
- Idioma UI: **español**. No agregar comentarios en código salvo que lo pidan.
- Sin comentarios en el código (petición explícita del usuario).
- Los modales/overlays usan `.auth-overlay` con `z-index: 100000` — mantener siempre por encima de `.splash-overlay` (z-index 99999). Ver commit `bc5ba31`.
- Mobile-first: breakpoint principal 700px (splash + `header` oculto debajo).
- Roles de usuario: `citizen | student | lawyer` (Firestore `usuarios/{uid}.role`).
- Al terminar un cambio: verificar con `npm run build` (incluye tsc) y proporcionar mensaje de commit descriptivo.

## Git
- Repo: https://github.com/Anthonymz04/varius_webapp
- Rama de trabajo: **`ariel_branch`**
- Push solo con confirmación explícita. Commits pequeños y descriptivos, uno por fix.

## Cambios recientes (historial de decisiones)
- `bc5ba31` fix(mobile): modal de login ahora se muestra sobre el splash screen — z-index AuthDialog 20→100000
- Actualización Next.js 15 → 16.3.1 (next-env.d.ts / tsconfig regenerados)
