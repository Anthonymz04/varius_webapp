# Firebase para VARIUS

1. Crea un proyecto Firebase y registra una **Web App**.
2. Activa Authentication (Google y correo/contraseña) y Firestore.
3. Copia los valores de configuración web a `.env.local` siguiendo `.env.example`.
4. Publica `firestore.rules` desde Firebase CLI o la consola. No uses reglas de prueba en producción.

## Colecciones

- `users/{uid}`: perfil y rol (`citizen`, `student`, `lawyer`).
- `lawyers/{uid}`: ficha pública, especialidades, precios y disponibilidad.
- `bookings/{id}`: reserva, participantes y estado.
- `conversations/{id}`: participantes y mensajes; la IA permanece en el servidor Next.
- `posts/{id}`: comunidad.

Las claves `NEXT_PUBLIC_FIREBASE_*` identifican la app web y son públicas; el acceso queda protegido por las reglas. Nunca añadas una cuenta de servicio, clave de OpenAI o secreto de pagos con el prefijo `NEXT_PUBLIC_`. Storage queda fuera del alcance actual y se añadirá cuando haya imágenes o documentos adjuntos.
