# Firebase para VARIUS

1. Crea un proyecto Firebase y registra una **Web App**.
2. Activa Authentication con **correo/contraseña**, Firestore y Storage. Google no se utiliza.
3. Copia los valores de configuración web a `.env.local` siguiendo `.env.example`.
4. Publica `firestore.rules` y `storage.rules` desde Firebase CLI o la consola; no uses reglas de prueba en producción.
5. Para correos reales, instala la extensión oficial Firebase **Trigger Email** y configúrala para vigilar la colección `mail`. La aplicación crea los mensajes con destinatario, asunto y texto; la extensión los entrega por el proveedor SMTP configurado.

## Colecciones

- `users/{uid}`: perfil, rol, ciudad y datos de verificación.
- `lawyers/{uid}`: ficha pública de abogados validados; ya no existe un catálogo estático.
- `consultationRequests/{id}`: solicitudes y su estado.
- `conversations/{id}/messages/{id}`: chats permanentes de asesorías aceptadas.
- `notifications/{id}` y `actionHistory/{id}`: alertas e historial inmutable.
- `mail/{id}`: cola de la extensión Trigger Email.

Storage almacena fotos de perfil y certificados PDF en `lawyer-certificates/{uid}`. Las claves `NEXT_PUBLIC_FIREBASE_*` son identificadores públicos; nunca expongas claves de OpenAI, cuentas de servicio o secretos de pago con ese prefijo.
