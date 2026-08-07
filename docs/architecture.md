# Arquitectura de producto — VARIUS

## Navegación MVP

`Splash → Onboarding → autenticación → selección de perfil → dashboard`.
Cada perfil comparte búsqueda, notificaciones, mensajes, perfil y ajustes. Ciudadano accede a IA, marketplace, reservas y biblioteca; estudiante a cursos, tutorías, casos y comunidad; abogado a agenda, solicitudes, clientes, reputación e ingresos.

## Capas y módulos

El frontend se organiza por `features` (auth, ai, marketplace, bookings, learning, community, profile) y componentes de diseño reutilizables. El backend NestJS debe reflejar esos módulos y separar `domain` (entidades/políticas), `application` (casos de uso), `infrastructure` (Prisma, Redis, OpenAI, Cloudinary) y `presentation` (REST/WebSocket).

## Datos y seguridad

Prisma/PostgreSQL almacena usuarios, perfiles profesionales, consultas, reservas, recursos, cursos, publicaciones, pagos y auditoría. Redis cubre rate limiting, colas y sesiones efímeras. Las llamadas a OpenAI ocurren solo desde el backend, con consentimiento, trazabilidad, redacción de PII y el aviso jurídico obligatorio. JWT en cookies `httpOnly`, RBAC, CSRF, validación Zod, límites de tasa y logs de auditoría son requisitos transversales.

## Fases

1. **MVP:** identidad, auth/RBAC, perfiles, IA orientativa, marketplace, disponibilidad y reservas.
2. **Beta:** pagos, mensajería, contenido/cursos, tutorías, notificaciones y administración.
3. **Producción:** analítica, moderación, i18n, observabilidad, pruebas E2E, respaldo, pentest y cumplimiento legal.
