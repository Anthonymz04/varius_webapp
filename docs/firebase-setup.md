# Firebase para VARIUS — guía paso a paso

La app no cambia: todo lo que necesita son las 6 variables `NEXT_PUBLIC_FIREBASE_*`.
Estas claves son identificadores públicos del proyecto; la seguridad la dan las reglas de
Firestore/Storage, no el secreto de estas claves.

## 1. Crear el proyecto nuevo

1. Entra a https://console.firebase.google.com con el correo nuevo.
2. **Crear proyecto** → nombre `varius` (el ID puede ser `varius-xxxx`).
3. Google Analytics: puedes desactivarlo (no se usa en el código).
4. Espera a que aprovisione (~1 min).

## 2. Authentication (solo correo/contraseña)

1. Menú **Build → Authentication → Comenzar**.
2. Pestaña **Sign-in method** → habilita **Correo electrónico/contraseña** (guardar).
3. No habilites Google: fue retirado de la app por problemas en el WebView del APK.
4. Pestaña **Settings → Authorized domains** → añade los dominios donde corre la app:
   - `localhost` (ya suele estar)
   - `varius-webapp-one.vercel.app` (producción)
   - `varius-webapp.vercel.app` (si aún existe el deploy alterno)
   - el dominio del túnel de pruebas (`*.ts.net` o `*.trycloudflare.com`) cuando lo uses

## 3. Firestore

1. **Build → Firestore Database → Crear base de datos**.
2. Elige **Modo de producción** y región. Recomendado: `southamerica-east1` (São Paulo,
   la más cercana a Ecuador); `us-central1` también funciona.
3. Las colecciones las crea la app sola al escribir; no hace falta crearlas a mano.

## 4. Storage

1. **Build → Storage → Comenzar** → modo **Producción**, misma región.
2. Sin esto `isFirebaseConfigured` da `false` y la app entera asume "sin Firebase".
3. Rutas que la app usa (ya cubiertas en `storage.rules`):
   - `avatars/{uid}/`, `covers/{uid}/` (perfil)
   - `certifications/{uid}/titulo.pdf`, `cvs/{uid}/hoja-vida.pdf` (verificación de abogado)
   - `chat/{conversacionId}/` (archivos de asesorías)
   - `profile-images/` y `lawyer-certificates/` quedan como legacy, sin uso

## 5. Claves de la app

1. **⚙ Configuración del proyecto → General → Tus apps → </> Web** → registra `VARIUS Web`.
2. Copia el objeto `firebaseConfig` y castea en el archivo local `.env.local`
   (sigue la plantilla de `.env.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=....firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=....appspot.com   (o .firebasestorage.app, copiar tal cual)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

3. En Vercel (producción del amigo): **Settings → Environment Variables** con las mismas
   6 claves + las de IA, y **redeployar** (las `NEXT_PUBLIC_*` van dentro del bundle).

## 6. Publicar reglas

Opción A (consola, sin CLI):
- Firestore: Build → Firestore Database → pestaña **Reglas** → pegar `firestore.rules` → Publicar.
- Storage: Build → Storage → pestaña **Rules** → pegar `storage.rules` → Publicar.

Opción B (CLI, desde este repo que ya tiene `firebase.json`):
```
npx firebase login
npx firebase use --add <projectId>
npx firebase deploy --only firestore:rules,storage
```

## 7. Primer usuario admin

1. Crea en la app una cuenta normal (correo/contraseña).
2. En la **consola Firestore** edita `users/{tu-uid}` y cambia `role` a `admin`.
3. Ya puedes entrar a `/admin` y aprobar verificaciones de abogado.

## 8. Esquema usado por la app (las reglas cubren esto)

- `users/{uid}` — `{ name, email, photoURL, role: citizen|student|lawyer|admin, city, university, career, cedula, certificateURL, cvURL, createdAt }`
- `lawyers/{uid}` — perfil público de abogado aprobado
- `lawyer_verifications/{uid}` — solicitud de verificación con cédula + PDFs
- `consultationRequests/{id}` — `{ clientId, lawyerId, status, conversacionId, ... }`
- `conversations/{id}/messages/{id}` — chat 1:1, campo `participantIds`, `senderId`
- `notifications/{id}` y `actionHistory/{id}` — `{ userId, actorId, type, title, ... }`
- `consultations/{id}` — historial del chat IA por `uid`
- `community_posts/{id}` — con `authorUid`, `likedBy[]`
- `community_comments/{id}` — sin `authorUid` (solo `author` como texto)
- `tutoria_reservas/{id}` — `{ uid, tutoriaId, fecha, hora }`

Convención del código: ordena del lado cliente y nunca combina `where` + `orderBy`
sobre el mismo query, para no requerir índices compuestos.

## Notas vigentes

- Los correos salientes fueron retirados del flujo: la colección `mail` y la función
  `queueEmail` ya no existen. Notificaciones reales = campanita (`notifications`).
- Si el teléfono del abogado no recibe la solicitud, revisar que las reglas estén
  publicadas (el clásico "No se pudo enviar" con dato sí guardado venía de eso).
