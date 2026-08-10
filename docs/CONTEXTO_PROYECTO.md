# VARIUS — Contexto del Proyecto

> **Propósito de este archivo:** Servir como fuente de verdad para cualquier asistente IA (OpenAI, Google, Anthropic, etc.) que trabaje en este proyecto. Debe leerse **al inicio de cada sesión** para entender qué es VARIUS, cómo está construido, qué decisiones se han tomado y qué cambios se han aplicado.

---

## 1. Qué es VARIUS

VARIUS es una **plataforma jurídica LegalTech** construida como **Progressive Web App (PWA)** para Ecuador. Conecta tres perfiles de usuario:

| Rol | Descripción |
|-----|-------------|
| **Ciudadano** | Persona con dudas legales. Busca orientación rápida y accesible. |
| **Estudiante** | Estudiante de Derecho. Busca aprender, tutorías y recursos. |
| **Abogado** | Profesional jurídico. Ofrece servicios, gana visibilidad. |

**Nombre:** "VA" (Valeska) + "RI" (Arianna) + "IUS" (Derecho en latín).
**Eslogan:** "El puente entre aprender, ejercer y acceder al Derecho."
**Fundadoras:** Valeska y Arianna, estudiantes de Derecho en Ecuador.
**Jurisdicción principal:** Ecuador.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | Next.js 15 (App Router) | TypeScript, React 19 |
| Auth | Firebase Authentication | Google + Email/Password |
| Base de datos | Cloud Firestore | Colecciones: users, lawyers, bookings, conversations, posts, resources |
| Almacenamiento de medios | Cloudinary | Fotos de perfil, certificaciones (por implementar) |
| Asistente IA | OpenAI API (gpt-4.1-mini) | Vía Next.js API Routes, enfocado en derecho ecuatoriano |
| Iconos | lucide-react | |
| Validación | Zod | En API routes |
| PWA | Service Worker + Web Manifest | |
| Hosting | Por definir | Compatible con Vercel |

### Decisiones técnicas clave

1. **NO se usa NestJS.** El backend se maneja 100% con Next.js API Routes. Firebase maneja auth y datos; las API Routes son wrappers livianos para IA y lógica server-side.
2. **NO se usa PostgreSQL/Prisma.** El schema de Prisma que existe en `/prisma/schema.prisma` es un diseño de referencia que no se conecta al frontend. Firestore es la única base de datos activa.
3. **NO se usa Redis.** El rate limiting actual es en memoria (suficiente para MVP).
4. **NO se implementan pagos/suscripciones** en el MVP.

---

## 3. Identidad Visual

| Elemento | Valor |
|----------|-------|
| Color primario (rosa viejo/wine) | `#C2185B` |
| Color secundario (negro carbón) | `#212121` |
| Color acento (dorado suave) | `#C9A227` |
| Tipografía títulos | Manrope (500-800) |
| Tipografía cuerpo | Plus Jakarta Sans (400-700) |
| Icono | V estilizada con punto dorado (SVG en `/public/icon.svg`) |

---

## 4. Estructura de Carpetas (objetivo)

```
varius_webapp/
├── app/
│   ├── layout.tsx              # Layout raíz con fonts, metadata, auth provider
│   ├── page.tsx                # Página de inicio / dashboard
│   ├── globals.css             # Estilos globales + variables CSS
│   ├── abogados/
│   │   └── page.tsx            # Marketplace de abogados
│   ├── asistente/
│   │   └── page.tsx            # Chat IA jurídico
│   ├── biblioteca/
│   │   └── page.tsx            # Recursos legales de Ecuador
│   ├── preguntas-frecuentes/
│   │   └── page.tsx            # FAQ
│   ├── perfil/
│   │   └── page.tsx            # Perfil del usuario
│   ├── tutorias/
│   │   └── page.tsx            # Guías y tutoriales (visual/demo)
│   ├── comunidad/
│   │   └── page.tsx            # Comunidad (visual/demo)
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── AuthDialog.tsx
│   │   ├── LawyerCard.tsx
│   │   └── ...
│   └── api/
│       └── ai/
│           └── route.ts        # Endpoint del asistente IA
├── lib/
│   ├── firebase/
│   │   ├── client.ts           # Inicialización de Firebase
│   │   └── profile.ts          # Funciones de perfil de usuario
│   └── auth-context.tsx        # React Context para autenticación
├── public/
│   ├── icon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── docs/
│   ├── CONTEXTO_PROYECTO.md    # ESTE ARCHIVO
│   ├── architecture.md
│   └── firebase-setup.md
├── prisma/
│   └── schema.prisma           # Schema de referencia (NO conectado)
└── .env.local                  # Variables de entorno (NO commitear)
```

---

## 5. Features del MVP - Clasificación

### Funcionales (deben funcionar completamente)

| Feature | Descripción |
|---------|-------------|
| **Autenticación** | Registro e inicio de sesión con Google y email/password. Selección de rol (ciudadano, estudiante, abogado). |
| **Marketplace de abogados** | Búsqueda y visualización de perfiles de abogados. Filtros por especialidad, ciudad. Contacto. |
| **Chat IA jurídico** | Asistente orientativo enfocado en derecho ecuatoriano. Usa OpenAI. Incluye disclaimer legal obligatorio. |
| **Biblioteca jurídica** | Repositorio de recursos digitales: leyes de Ecuador, guías, documentos útiles. |
| **Preguntas frecuentes** | Sección de FAQ sobre temas legales comunes en Ecuador. |

### Visual/Demo (se ven pero no son completamente funcionales)

| Feature | Descripción |
|---------|-------------|
| **Tutorías** | Se muestra contenido educativo/guías tipo tutorial. Sin reserva real de horarios. |
| **Comunidad** | Interfaz visual de foro/red social interna. Sin posts reales. |

### Excluidos del MVP

- Cursos formales
- Pagos y suscripciones
- Mensajería directa entre usuarios
- Notificaciones push
- Panel de administración

---

## 6. Colecciones de Firestore

```
users/{uid}
  displayName: string
  email: string
  photoURL: string | null
  role: "citizen" | "student" | "lawyer"
  createdAt: timestamp
  updatedAt: timestamp

lawyers/{uid}
  displayName: string
  headline: string (especialidad)
  bio: string
  city: string
  priceCents: number
  rating: number
  reviewCount: number
  verified: boolean
  specialties: string[]
  photoURL: string | null
  createdAt: timestamp
  updatedAt: timestamp

resources/{id}
  title: string
  type: "ley" | "guia" | "modelo" | "glosario"
  description: string
  url: string (link al documento)
  category: string
  createdAt: timestamp
  updatedAt: timestamp

bookings/{id}         (visual/demo en MVP)
conversations/{id}    (visual/demo en MVP)
posts/{id}            (visual/demo en MVP)
```

---

## 7. Convenciones de Código

- **Idioma del código:** inglés (nombres de variables, funciones, componentes)
- **Idioma de la UI:** español
- **Componentes:** PascalCase, un componente por archivo
- **Archivos:** kebab-case para rutas, PascalCase para componentes
- **Imports:** usar alias `@/` -> raíz del proyecto
- **CSS:** vanilla CSS con custom properties, organizado por secciones
- **API responses:** `{ message: string }` para éxito, `{ error: string }` para error
- **Asistente IA:** siempre incluir disclaimer legal al final de cada respuesta

---

## 8. Variables de Entorno

```env
# OpenAI (SECRETO - nunca exponer al cliente)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4.1-mini

# Firebase (PUBLICO - seguro exponer con NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=varius-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=varius-prod
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=788...
NEXT_PUBLIC_FIREBASE_APP_ID=1:788...:web:...

# Cloudinary (por configurar)
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

---

## 9. Changelog

| Fecha | Cambio | Archivos afectados |
|-------|--------|-------------------|
| 2026-08-07 | Revisión inicial del proyecto. Identificación de problemas: monolito en page.tsx, CSS minificado, sin rutas reales, dualidad Firestore/Prisma | — (análisis) |
| 2026-08-07 | Decisiones arquitectónicas: Firebase + Firestore como stack principal, eliminar dependencia de Prisma/PostgreSQL, mantener Next.js API Routes, jurisdicción Ecuador | — (planificación) |
| 2026-08-07 | Creación de CONTEXTO_PROYECTO.md | `docs/CONTEXTO_PROYECTO.md` |
| 2026-08-07 | **Fase 0:** Renombrar .env → .env.local, crear .env.example, agregar @/ path alias, crear AuthProvider/Context | `.env.local`, `.env.example`, `tsconfig.json`, `lib/auth-context.tsx` |
| 2026-08-07 | **Fase 1:** Desminificar CSS (~900 líneas organizadas), extraer 4 componentes (Header, BottomNav, AuthDialog, LawyerCard), crear 8 rutas reales, reescribir layout.tsx y page.tsx | `globals.css`, `layout.tsx`, `page.tsx`, `components/*`, `abogados/`, `asistente/`, `biblioteca/`, `preguntas-frecuentes/`, `perfil/`, `tutorias/`, `comunidad/` |
| 2026-08-07 | **Fase 2:** Auth con 3 roles integrado via AuthContext, perfil dinámico según rol, fecha y nombre dinámicos en dashboard | `page.tsx`, `perfil/page.tsx`, `components/Header.tsx` |
| 2026-08-07 | **Fase 3:** Marketplace con filtros funcionales (búsqueda, especialidad, ciudad), 6 abogados mock | `abogados/page.tsx` |
| 2026-08-07 | **Fase 4:** Prompt IA actualizado para legislación ecuatoriana (Constitución, COIP, Código del Trabajo, etc.) | `api/ai/route.ts`, `asistente/page.tsx` |
| 2026-08-07 | **Fase 5:** Biblioteca con 11 recursos legales ecuatorianos, FAQ con 10 preguntas en 5 categorías | `biblioteca/page.tsx`, `preguntas-frecuentes/page.tsx` |
| 2026-08-07 | **Fase 6:** Tutorías (6 guías demo) y Comunidad (4 posts mock) como páginas visuales | `tutorias/page.tsx`, `comunidad/page.tsx` |
| 2026-08-07 | **Fase 7:** Build exitoso, 10 rutas generadas, warnings de autoprefixer corregidos | `globals.css` |
| 2026-08-08 | **UX:** Separar página principal en Landing pública (sin login) + Dashboard privado (con login). Header ahora muestra "Acceder" cuando no hay sesión, oculta notificaciones/avatar. Nuevo componente MobileSplash para pantalla de bienvenida tipo app en móvil. Landing incluye: hero con preview de chat, cómo funciona (3 pasos), beneficios, preview de abogados, preview de biblioteca, FAQ, CTA final. | `page.tsx`, `Header.tsx`, `MobileSplash.tsx`, `layout.tsx`, `globals.css` |

---

## 10. Notas para Futuros Asistentes IA

1. **Lee este archivo primero** antes de hacer cualquier cambio.
2. **Actualiza la sección 9 (Changelog)** cada vez que hagas cambios significativos.
3. El esquema Prisma en `/prisma/schema.prisma` es solo referencia. **NO** intentes conectarlo.
4. Las claves de Firebase con prefijo `NEXT_PUBLIC_` son públicas por diseño. Las protegen las Firestore Rules.
5. La app es para **estudiantes de Derecho en Ecuador** presentando un proyecto. El nivel de complejidad debe ser **MVP funcional**, no enterprise.
6. La documentación original del proyecto está en `/varius_documentacion_optimizada.md`.
