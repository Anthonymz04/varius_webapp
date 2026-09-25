# SUPABASE_SETUP.md — Migración de Firebase Storage a Supabase Storage

## Por qué
Firebase Storage exige plan **Blaze** (tarjeta de crédito) aun estando dentro de la franja gratuita.
Supabase Storage es gratis sin tarjeta: **1 GB almacenamiento + 2 GB transferencia/mes**.
Auth y Firestore siguen en Firebase — solo se migró el almacenamiento de archivos.

## Qué se guarda (mismos paths que antes en Firebase)
| Carpeta | Contenido | Límite | Tipo |
|---|---|---|---|
| `avatars/{uid}/avatar.*` | Foto de perfil | 5 MB | imagen |
| `covers/{uid}/cover.*` | Foto de portada | 5 MB | imagen |
| `profile-images/{uid}/*` | (compat reglas antiguas) | 5 MB | imagen |
| `certifications/{uid}/titulo.pdf` | Título de abogado | 10 MB | PDF |
| `cvs/{uid}/hoja-vida.pdf` | Hoja de vida | 10 MB | PDF |
| `lawyer-certificates/{uid}/*` | (compat reglas antiguas) | 10 MB | PDF |
| `chat/{conversacionId}/*` | Adjuntos del chat | 20 MB | cualquiera |

## Pasos de configuración (una sola vez)

### 1. Crear proyecto Supabase
1. https://supabase.com → Sign up (sin tarjeta)
2. New Project → nombre `varius`, región `sa-east-1` (São Paulo), password de DB (guárdala)
3. En Settings → API copiar: **Project URL** y **anon public key**

### 2. Crear el bucket
Dashboard → Storage → New bucket:
- Name: `uploads`
- **Public bucket: ON** (las URLs públicas se usan para avatares/portadas/adjuntos)

### 3. Políticas (SQL Editor → New query → pegar y Run)
Replican `storage.rules` de Firebase (tamaños y tipos por carpeta):

```sql
-- INSERT: subir archivos nuevos
create policy "uploads_public_insert"
on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'uploads'
  and (
    (
      (name like 'avatars/%' or name like 'covers/%' or name like 'profile-images/%')
      and name not like '%/../%'
      and (metadata->>'size')::bigint < 5 * 1024 * 1024
      and (metadata->>'mimetype') ~* '^image/'
    )
    or (
      (name like 'certifications/%' or name like 'cvs/%' or name like 'lawyer-certificates/%')
      and name not like '%/../%'
      and (metadata->>'size')::bigint < 10 * 1024 * 1024
      and (metadata->>'mimetype') = 'application/pdf'
    )
    or (
      name like 'chat/%'
      and name not like '%/../%'
      and (metadata->>'size')::bigint < 20 * 1024 * 1024
    )
  )
);

-- UPDATE: reemplazar archivos existentes (upsert de avatar/cover/titulo)
create policy "uploads_public_update"
on storage.objects for update to anon, authenticated
using (bucket_id = 'uploads')
with check (bucket_id = 'uploads');

-- DELETE: permitir borrado (reemplazos / limpieza futura)
create policy "uploads_public_delete"
on storage.objects for delete to anon, authenticated
using (bucket_id = 'uploads');
```

> Tradeoff a conocer: el bucket es público-lectura (como las URLs firmadas de Firebase
> pero sin token). Los PDF de títulos son accesibles si alguien adivina el path
> (`certifications/{uid}`). Nivel aceptable para MVP; si luego quiere privacidad
> real de los PDF se puede migrar a bucket privado + URLs firmadas desde una API route.

### 4. Variables de entorno
`.env.local` (y el proyecto en Vercel → Settings → Environment Variables):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=uploads
```

### 5. Verificar
- `npm run dev` → perfil → subir avatar/portada → debe quedar foto visible
- Verificación de abogado con PDF → revisar en Supabase Storage que aparece `certifications/{uid}/titulo.pdf`
- Chat (/mensajes) → adjuntar archivo

## Código tocado
- `lib/supabase/client.ts` (nuevo): cliente + flag `isSupabaseConfigured`
- `lib/firebase/uploads.ts`: misma API (`uploadFile`, `uploadCover`, `uploadAvatar`,
  `uploadCertificate`, `uploadCV`, `uploadChatFile`) pero escribe en Supabase Storage.
  Ningún call-site cambió (perfil, AuthDialog, mensajes).
- `lib/firebase/client.ts`: queda el init de Storage inerte/legacy (puede eliminarse
  la dependencia `firebase/storage` cuando todo esté estabilizado).
- `storage.rules`: queda obsoleto para archivos (Firebase ya no almacena nada).
