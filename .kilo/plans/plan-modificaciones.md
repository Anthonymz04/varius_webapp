# PLAN — Modificaciones VARIUS (prioridad del usuario)

Orden priorizado por el usuario:
1. Rotación (bloqueo portrait en APK + media query landscape)
2. Menú hamburguesa → menú de configuración completo
3. Admin: eliminar usuario (solo Firestore)
4. Icono/splash con logo real (generado desde SVG)

---

## 1) ROTACIÓN — bloquear portrait + landscape layout móvil

### 1a. AndroidManifest.xml (APK se bloquea en vertical)
Archivo: `android/app/src/main/AndroidManifest.xml`
En el `<activity>` de MainActivity agregar:
```xml
android:screenOrientation="portrait"
```
Queda así (agregar la línea `android:screenOrientation="portrait"` antes del cierre `>`):
```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
    android:name=".MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true"
    android:screenOrientation="portrait">
```
Nota: requiere `npx cap sync android` + rebuild APK.

### 1b. globals.css — media query landscape (web se mantiene móvil en horizontal)
Agregar al final de `app/globals.css`:
```css
/* Mantener layout móvil cuando el teléfono se pone horizontal (ancho >700px pero pantalla baja) */
@media (orientation: landscape) and (max-height: 500px) {
  .hero { padding: 24px 20px 16px; display: block; }
  .hero-inner { display: block; }
  .hero h1 { font-size: 20px; }
  .summary-card { display: none; }
  .desktop-nav, .search-btn, .header-actions .icon-btn, .avatar.small { display: none; }
  .mobile-menu { display: block; }
  .bottom-nav { display: flex; }
  .two-col, .news, .site-footer { display: none; }
}
```
Esto evita que en horizontal la app se vea como escritorio.

---

## 2) MENÚ HAMBURGUESA → MENÚ DE CONFIGURACIÓN

### 2a. Header.tsx — reestructurar `.mobile-nav`
Archivo: `app/components/Header.tsx`
Reemplazar el bloque `{menu && (<nav className="mobile-nav">...)}` por un menú con secciones:

Estructura propuesta:
- **Perfil**: "Mi perfil" (icono User) → `/perfil` (avatar + nombre + rol)
- **Sección ACCOUNT**: "Configuración de cuenta" → `/perfil`
- **Sección ACTIVIDAD**: "Notificaciones" (Bell) → abre campanita; "Asesorías activas" → `/mensajes`
- **Sección VARIUS**: "Misión" y "Visión" → `/nosotros`; "Contáctanos" → `/nosotros`; "Redes sociales" (Instagram/TikTok/YouTube) → enlaces externos
- **Sección AYUDA**: "Soporte" → `/asistente`; "Preguntas frecuentes" → `/preguntas-frecuentes`
- **Cerrar sesión** (LogOut, vino) al final, separado con hairline

Imports a agregar en Header.tsx:
```tsx
import { Bell, BookOpen, HelpCircle, Instagram, LogOut, Mail, MessageCircle, Settings, Share2, User, Users, Youtube, Music2 } from 'lucide-react';
```

Estructura JSX de ejemplo:
```tsx
{menu && (
  <nav className="mobile-nav">
    <Link className="mn-profile" href="/perfil" onClick={() => setMenu(false)}>
      <span className="mn-avatar">{initials}</span>
      <span>
        <b>{user?.displayName || 'Mi perfil'}</b>
        <small>{user ? roleLabel : 'Inicia sesión'}</small>
      </span>
    </Link>

    <div className="mn-section">ACTIVIDAD</div>
    <Link className="mn-item" href="/mensajes" onClick={() => setMenu(false)}>
      <MessageCircle size={17} /> Asesorías activas
    </Link>
    <Link className="mn-item" href="/perfil" onClick={() => setMenu(false)}>
      <Settings size={17} /> Configuración de cuenta
    </Link>

    <div className="mn-section">VARIUS</div>
    <Link className="mn-item" href="/nosotros" onClick={() => setMenu(false)}>
      <BookOpen size={17} /> Misión y visión
    </Link>
    <Link className="mn-item" href="/nosotros" onClick={() => setMenu(false)}>
      <Mail size={17} /> Contáctanos
    </Link>

    <div className="mn-section">AYUDA</div>
    <Link className="mn-item" href="/preguntas-frecuentes" onClick={() => setMenu(false)}>
      <HelpCircle size={17} /> Preguntas frecuentes
    </Link>
    <Link className="mn-item" href="/asistente" onClick={() => setMenu(false)}>
      <Users size={17} /> Soporte con IA
    </Link>

    <div className="mn-section">SÍGUENOS</div>
    <div className="mn-socials">
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
      <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"><Music2 size={18} /></a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
    </div>

    {user && (
      <>
        <div className="mn-sep" />
        <button className="mn-logout" onClick={handleLogout}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </>
    )}
  </nav>
)}
```

### 2b. globals.css — estilos del menú
Reemplazar el bloque `.mobile-nav` por uno con las clases:
- `.mobile-nav` → ancho `min(320px, calc(100vw - 40px))`, padding, scroll vertical (max-height)
- `.mn-profile` → fila con avatar circular + nombre + rol
- `.mn-section` → label pequeño gris (10px, mayúsculas, letter-spacing)
- `.mn-item` → fila con icono gris + texto, hover vino
- `.mn-socials` → fila de botones circulares de redes
- `.mn-sep` → hairline
- `.mn-logout` → texto vino, full width

---

## 3) ADMIN — ELIMINAR USUARIO (solo Firestore)

### 3a. lib/firebase/admin.ts — agregar funciones
```ts
export async function fetchAllUsers(limitN = 50): Promise<{ id: string; name: string; email: string; role: string; createdAt?: number }[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'users'), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as ...;
  } catch { return []; }
}

export async function deleteUserData(uid: string): Promise<void> {
  if (!db) throw new Error('Firebase no está configurado.');
  // eliminar docs de todas las colecciones del usuario
  await Promise.all([
    deleteDoc(doc(db, 'users', uid)).catch(() => {}),
    deleteDoc(doc(db, 'lawyers', uid)).catch(() => {}),
    deleteDoc(doc(db, 'lawyer_verifications', uid)).catch(() => {}),
  ]);
  // peticiones de asesoría del usuario (cliente o abogado)
  const reqs = await getDocs(query(collection(db, 'consultationRequests'), where('clientId', '==', uid)));
  reqs.forEach((d) => void deleteDoc(d.ref).catch(() => {}));
  const reqs2 = await getDocs(query(collection(db, 'consultationRequests'), where('lawyerId', '==', uid)));
  reqs2.forEach((d) => void deleteDoc(d.ref).catch(() => {}));
  // conversaciones donde participa
  const convos = await getDocs(query(collection(db, 'conversations'), where('participantIds', 'array-contains', uid)));
  convos.forEach((d) => void deleteDoc(d.ref).catch(() => {}));
  // notificaciones e historial
  const notif = await getDocs(query(collection(db, 'notifications'), where('userId', '==', uid)));
  notif.forEach((d) => void deleteDoc(d.ref).catch(() => {}));
  const hist = await getDocs(query(collection(db, 'actionHistory'), where('userId', '==', uid)));
  hist.forEach((d) => void deleteDoc(d.ref).catch(() => {}));
}
```
Nota: no elimina la cuenta de autenticación (requiere Admin SDK) — por ahora solo datos. El usuario no podría volver a ver sus datos, pero su cuenta auth sigue. Documentar esto.

### 3b. app/admin/page.tsx — sección Usuarios
- Agregar pestaña/switch entre "Verificaciones pendientes" y "Usuarios".
- Lista con nombre, email, rol y botón "Eliminar" (con confirmación `window.confirm`).
- Importar `deleteUserData` y `fetchAllUsers`.

---

## 4) ICONO / SPLASH CON LOGO REAL

### 4a. Generar logo cuadrado aislado desde public/icon.svg
`public/icon.svg` ya es el logo real descargado (V+A+pilar+balanza, fondo blanco #ffffff según el SVG). Generar con sharp:
- `public/splash-logo.png` (512x512, transparente si el SVG lo permite; si tiene fondo blanco, recortar al contenido y centrar)

Script (basado en scripts/generate-icons.mjs):
```js
import sharp from 'sharp';
// recortar al contenido (trim) y exportar 512x512 transparente
await sharp('public/icon.svg').trim().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('public/splash-logo.png');
```

### 4b. Splash web (MobileSplash.tsx + CSS)
- En `.boot-splash` y `.splash-logo`, reemplazar la letra "V" por `<img src="/splash-logo.png">`.
- Ajustar CSS: `.boot-logo`/`.splash-logo` pasan a contener una imagen (border-radius opcional, tamaño 96px).

### 4c. Splash nativo Android + launcher (ya usan public/icon.svg vía npm run icons)
- Ya generados con el logo real (icon-192/512, maskable, splash.png de Android, ic_launcher). Solo verificar que quedaron bien; si el recorte del logo ayuda, regenerar con `npm run icons`.

### 4d. Manifest PWA
- `public/manifest.webmanifest` ya apunta a los PNG del logo real. Verificar.

---

## Orden de implementación
1. Rotación (Manifest + CSS) → sync + rebuild APK
2. Menú configuración (Header.tsx + globals.css)
3. Admin eliminar usuario (admin.ts + admin/page.tsx)
4. Splash logo (script + MobileSplash + CSS + rebuild)

## Verificación
- `npm run build` (incluye tsc)
- `npx cap sync android` + `.\gradlew.bat assembleDebug` para APK
- Probar: rotación bloqueada en APK, menú completo, eliminar usuario en /admin, splash con logo
