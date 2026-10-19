# INVICORP INVENTORY

Aplicación móvil de gestión de inventario profesional (PWA) desarrollada con React, TypeScript, Vite, Tailwind CSS y Supabase.

## Características

- **Autenticación segura mediante PIN** con derivación de claves (PBKDF2 + salt único)
- **Dashboard** con estadísticas en tiempo real
- **CRUD de productos** con imágenes, SKU, código de barras, stock, valor
- **Entradas y salidas** con control transaccional de existencias
- **Historial de movimientos** verificable
- **Proveedores y categorías**
- **Alertas de stock bajo y agotado**
- **Reportes exportables a CSV**
- **Usuarios y roles** (Administrador, Supervisor, Operador)
- **PWA instalable** en Android, iOS y escritorio
- **Modo sin conexión** con cola de sincronización
- **Diseño responsive** para móviles, tablets y escritorio

## Arquitectura

```
Frontend:  React 18 + TypeScript + Vite
Estilos:   Tailwind CSS (modo oscuro)
Iconos:    Lucide React
Estado:    TanStack Query + Zustand
Forms:     React Hook Form + Zod
Backend:   Supabase (PostgreSQL + Auth + Realtime + Storage)
PWA:       vite-plugin-pwa + Workbox
Offline:   IndexedDB (idb) + cola de sincronización
Pruebas:   Vitest + React Testing Library
```

## Estructura del proyecto

```
invicorp-inventory/
├── src/
│   ├── main.tsx              # Punto de entrada
│   ├── App.tsx               # Rutas y autenticación
│   ├── index.css             # Tailwind + estilos base
│   ├── lib/                  # Utilidades (Supabase, crypto, storage, red)
│   ├── stores/               # Estado global (Zustand)
│   ├── services/             # Capa de API (Supabase)
│   ├── components/           # Componentes reutilizables
│   ├── pages/                # Páginas de la aplicación
│   ├── contexts/             # Contexto de bloqueo PIN
│   ├── types/                # Tipos TypeScript
│   └── contexts/
├── supabase/
│   └── migrations/           # Migraciones SQL
├── public/
│   ├── manifest.json         # Manifiesto PWA
│   └── icons/                # Iconos PWA (generar)
├── .env.example              # Variables de entorno (sin secretos)
├── vite.config.ts            # Configuración Vite + PWA
├── tailwind.config.js        # Configuración Tailwind
├── tsconfig.json             # Configuración TypeScript
└── package.json              # Dependencias y scripts
```

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Una cuenta en [Supabase](https://supabase.com)

## Instalación

```bash
# 1. Clona o copia el proyecto
cd invicorp-inventory

# 2. Instala dependencias
npm install

# 3. Configura variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 4. Ejecuta en modo desarrollo
npm run dev

# 5. Construye para producción
npm run build

# 6. Previsualiza producción
npm run preview

# 7. Ejecuta pruebas
npm test

# 8. Verifica tipos
npm run typecheck
```

## Configuración de Supabase

### 1. Crear proyecto en Supabase

Ve a [https://app.supabase.com](https://app.supabase.com) y crea un nuevo proyecto.

### 2. Ejecutar migraciones

En el Editor SQL de Supabase, ejecuta las migraciones en `supabase/migrations/` en orden.

### 3. Obtener credenciales

En Configuración > API, obtén:
- **URL del proyecto**: `VITE_SUPABASE_URL`
- **clave pública (anon)**: `VITE_SUPABASE_ANON_KEY`

Agrega estas valores a tu archivo `.env`.

### 4. Configurar Storage

Crea un bucket llamado `product-images` con acceso público para leer imágenes.

### 5. Row Level Security (RLS)

Las migraciones incluyen políticas RLS para que cada negocio solo acceda a sus propios datos.

## Base de datos

Tablas principales:
- `profiles` - Usuarios del sistema
- `businesses` - Negocios/empresas
- `business_members` - Miembros de negocio con roles
- `products` - Catálogo de productos
- `categories` - Categorías de productos
- `suppliers` - Proveedores
- `inventory_movements` - Historial de movimientos
- `notifications` - Centro de notificaciones
- `audit_logs` - Bitácora de auditoría
- `user_settings` - Configuración de usuario

## Seguridad del PIN

1. El PIN **nunca** se almacena en texto plano.
2. Se genera un salt único por usuario.
3. El hash se deriva con PBKDF2 (SHA-256, 200,000 iteraciones).
4. Límite de 5 intentos fallidos → bloqueo de 15 minutos.
5. El PIN es una capa de acceso rápido, no sustituye la autenticación de Supabase.
6. La clave `service_role` **nunca** se expone al frontend.

## PWA (Progressive Web App)

La aplicación es una PWA instalable:

### Android (Chrome)
1. Abre la app en Chrome
2. Toca el menú ⋮ > "Agregar a pantalla de inicio"

### iPhone (Safari)
1. Abre la app en Safari
2. Toca Compartir > "En la pantalla de inicio"

### Escritorio (Chrome/Edge)
1. Abre la app
2. Aparecerá un ícono de instalación en la barra de direcciones

### Limitaciones de PWA vs nativa
- No acceso completo a hardware (cámara, Bluetooth, NFC)
- Notificaciones push limitadas en iOS
- Sin distribución por App Store/Google Play
- Funcionamiento sin conexión limitado a datos en caché

Para funciones nativas completas, empaquetar con Capacitor en una fase futura.

## Pruebas

```bash
npm test
```

Las pruebas cubren:
- Verificación de PIN
- Cálculo de estadísticas
- Validación de formularios
- Servicios de API

## Despliegue en HTTPS

La PWA requiere HTTPS para funcionar correctamente (service workers, instalación).

```bash
# Construir para producción
npm run build

# El resultado está en dist/
# Despliega en cualquier hosting estático (Vercel, Netlify, Firebase Hosting, etc.)
```

## Soporte multiusuario y multi-negocio

Cada usuario pertenece a un negocio. Los datos están aislados mediante RLS en Supabase. Un usuario de "Negocio A" no puede ver datos de "Negocio B".

## Limitaciones conocidas

- El modo sin conexión permite consultar datos en caché; las escrituras se encolan y sincronizan al recuperar la conexión.
- No se permiten cantidades negativas de stock.
- Las imágenes de productos se almacenan en Supabase Storage.
- Para empaquetar como app nativa (Android/iOS), usar Capacitor.

## Licencia

Privado - INVICORP INVENTORY
