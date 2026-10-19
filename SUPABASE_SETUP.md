# Configuración de Supabase — INVICORP INVENTORY

Esta guía te lleva paso a paso para configurar Supabase como backend de la aplicación.

## 1. Crear proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com).
2. Inicia sesión o regístrate.
3. Haz clic en **New Project**.
4. Completa:
   - **Name:** `INVICORP INVENTORY`
   - **Database Password:** guárdala (se usa para el SQL Editor).
   - **Region:** elige la más cercana a tus usuarios.
5. Haz clic en **Create new project** y espera a que se provisione.

## 2. Obtener credenciales

1. En el dashboard de Supabase, ve a **Settings → API**.
2. Copia:
   - **Project URL:** `https://tu-proyecto-ref.supabase.co`
   - **Project API keys → `anon public`:** la clave pública larga que empieza con `eyJ...`

> ⚠️ **Nunca uses la `service_role` key en el frontend.** Esa clave tiene acceso total y debe permanecer solo en el servidor/Edge Functions.

## 3. Variables de entorno

En la raíz del proyecto (`invicorp-inventory/`):

```bash
copy .env.example .env
```

Edita `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...tu_anon_key_aquí...

VITE_AUTO_LOCK_MINUTES=30
VITE_LOW_STOCK_THRESHOLD=100
```

## 4. Ejecutar migraciones SQL

1. En el dashboard de Supabase, ve a **SQL Editor**.
2. Abre el archivo `supabase/migrations/001_initial_schema.sql` y copia TODO su contenido.
3. Pégalo en el SQL Editor y haz clic en **Run**.

Esto crea:
- Tablas: `businesses`, `profiles`, `business_members`, `categories`, `suppliers`, `products`, `inventory_movements`, `notifications`, `audit_logs`, `user_settings`
- Índices, triggers de `updated_at`, funciones de seguridad PIN
- Políticas **RLS** para aislar datos por negocio
- Datos de ejemplo (modo prueba)

## 5. Configurar Storage (imágenes de productos)

1. Ve a **Storage** en el menú lateral.
2. Haz clic en **New bucket**.
3. Configura:
   - **Name:** `product-images`
   - **Public bucket:** ✅ Sí (requerido para que las imágenes se vean en la app).
4. Haz clic en **Create bucket**.

## 6. Crear el primer usuario y negocio (setup inicial)

### 6.1 Crear negocio

```sql
INSERT INTO businesses (name, ruc, email)
VALUES ('Mi Negocio INVICORP', '900123456', 'negocio@ejemplo.com');
```

Anota el `id` generado (UUID).

### 6.2 Crear usuario en Supabase Auth

1. Ve a **Authentication → Users**.
2. Haz clic en **Add user**.
3. Completa:
   - Email: `admin@invicorp.com`
   - Password: elige uno seguro
   - **Auto Confirm User:** ✅ Sí

Anota el `id` del usuario creado.

### 6.3 Crear perfil

```sql
INSERT INTO profiles (
  id, email, full_name, role, business_id,
  is_active, auto_lock_minutes, language
)
VALUES (
  'uuid-del-usuario-de-auth',
  'admin@invicorp.com',
  'Administrador INVICORP',
  'administrador',
  'uuid-del-negocio',
  true,
  30,
  'es'
);
```

### 6.4 Crear membresía de negocio

```sql
INSERT INTO business_members (business_id, user_id, role)
VALUES ('uuid-del-negocio', 'uuid-del-usuario', 'administrador');
```

### 6.5 Configuración de usuario (opcional)

```sql
INSERT INTO user_settings (
  user_id, theme, language, notifications_enabled, auto_lock_minutes
)
VALUES (
  'uuid-del-usuario', 'dark', 'es', true, 30
);
```

## 7. Probar la aplicación

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Verás la pantalla de bloqueo PIN. Configura tu PIN de 6 dígitos y accede al dashboard.

## 8. Seguridad importante

| Regla | ¿Por qué? |
|-------|-----------|
| PIN nunca en texto plano | Se deriva con PBKDF2 + SHA-256 + salt único por usuario |
| Límite de 5 intentos fallidos | Bloqueo de 15 minutos tras 5 errores |
| RLS en todas las tablas | Un negocio no puede ver datos de otro negocio |
| No exponer `service_role` | Solo para Edge Functions o servidor backend |
| HTTPS requerido | La PWA y los service workers requieren HTTPS en producción |

## 9. Opcional: Argon2id via Edge Function

Para producción máxima, crea una Edge Function en Supabase llamada `verify-pin` que use `argon2` para verificar el PIN, y llámala desde el frontend en lugar de verificar localmente.

## 10. Solución de problemas

| Problema | Solución |
|----------|----------|
| Error de conexión a Supabase | Verifica `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env` |
| RLS bloquea consultas | Asegúrate de que el usuario tenga una membresía en `business_members` |
| Imágenes no se ven | Verifica que el bucket `product-images` sea público |
| PIN no se guarda | Verifica que el usuario tenga fila en `profiles` con `pin_hash` y `pin_salt` |
