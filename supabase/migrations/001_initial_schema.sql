-- =============================================================================
-- INVICORP INVENTORY - Esquema inicial de base de datos
-- PostgreSQL + Supabase con Row Level Security (RLS)
-- =============================================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Tablas de negocio
-- -----------------------------------------------------------------------------

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ruc text,
  address text,
  phone text,
  email text,
  logo_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 2. Perfiles de usuario (extiende auth.users de Supabase)
-- -----------------------------------------------------------------------------

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'operador' check (role in ('administrador', 'supervisor', 'operador')),
  business_id uuid references businesses(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Seguridad PIN
  pin_hash text,           -- hash derivado (PBKDF2/SHA-256), nunca texto plano
  pin_salt text,           -- salt único por usuario
  pin_attempts integer default 0,
  pin_locked_until timestamptz,
  last_pin_success timestamptz,
  last_activity_at timestamptz,
  auto_lock_minutes integer default 30,
  language text default 'es'
);

-- -----------------------------------------------------------------------------
-- 3. Miembros de negocio (relación muchos a muchos)
-- -----------------------------------------------------------------------------

create table business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'operador' check (role in ('administrador', 'supervisor', 'operador')),
  joined_at timestamptz default now(),
  unique(business_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. Categorías
-- -----------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  description text,
  icon text,
  color text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 5. Proveedores
-- -----------------------------------------------------------------------------

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- 6. Productos
-- -----------------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  sku text not null,
  barcode text,
  name text not null,
  description text,
  brand text,
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  current_stock integer not null default 0 check (current_stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  unit text not null default 'unidad',
  location text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  unique(business_id, sku)
);

-- Índices para productos
create index idx_products_business on products(business_id);
create index idx_products_sku on products(sku);
create index idx_products_barcode on products(barcode);
create index idx_products_category on products(category_id);
create index idx_products_supplier on products(supplier_id);
create index idx_products_active on products(is_active);

-- -----------------------------------------------------------------------------
-- 7. Movimientos de inventario
-- -----------------------------------------------------------------------------

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  type text not null check (type in ('entrada', 'salida', 'ajuste', 'devolucion', 'correccion')),
  quantity integer not null check (quantity > 0),
  previous_stock integer not null check (previous_stock >= 0),
  new_stock integer not null check (new_stock >= 0),
  reason text,
  notes text,
  reference text,
  created_at timestamptz default now(),
  created_by uuid references profiles(id) on delete set null
);

-- Índices para movimientos
create index idx_movements_business on inventory_movements(business_id);
create index idx_movements_product on inventory_movements(product_id);
create index idx_movements_type on inventory_movements(type);
create index idx_movements_created_at on inventory_movements(created_at);

-- -----------------------------------------------------------------------------
-- 8. Notificaciones
-- -----------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('stock_bajo', 'stock_agotado', 'entrada', 'salida', 'ajuste', 'administrativo')),
  title text not null,
  message text not null,
  is_read boolean default false,
  read_at timestamptz,
  product_id uuid references products(id) on delete set null,
  movement_id uuid references inventory_movements(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_notifications_business on notifications(business_id);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(is_read);

-- -----------------------------------------------------------------------------
-- 9. Bitácora de auditoría
-- -----------------------------------------------------------------------------

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index idx_audit_logs_business on audit_logs(business_id);
create index idx_audit_logs_user on audit_logs(user_id);
create index idx_audit_logs_created_at on audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- 10. Configuración de usuario
-- -----------------------------------------------------------------------------

create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  theme text default 'dark',
  language text default 'es',
  notifications_enabled boolean default true,
  auto_lock_minutes integer default 30,
  low_stock_threshold_percent integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- -----------------------------------------------------------------------------
-- 11. Función update_updated_at_column (DEBE IR ANTES DE LOS TRIGGERS)
-- -----------------------------------------------------------------------------

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 12. Triggers de updated_at
-- -----------------------------------------------------------------------------

create trigger businesses_updated_at before update on businesses
  for each row execute update_updated_at_column();

create trigger profiles_updated_at before update on profiles
  for each row execute update_updated_at_column();

create trigger categories_updated_at before update on categories
  for each row execute update_updated_at_column();

create trigger suppliers_updated_at before update on suppliers
  for each row execute update_updated_at_column();

create trigger products_updated_at before update on products
  for each row execute update_updated_at_column();

create trigger user_settings_updated_at before update on user_settings
  for each row execute update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 13. Funciones de seguridad para PIN
-- -----------------------------------------------------------------------------

-- Función para verificar PIN (placeholder; en producción usar Argon2id via Edge Function)
create or replace function verify_pin(pin text, hash text, salt text)
returns boolean
language plpgsql
as $$
declare
  computed_hash text;
begin
  return hash = encode(digest(pin || salt, 'sha256'), 'hex');
end;
$$;

-- =============================================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- Cada negocio solo puede acceder a sus propios datos.
-- =============================================================================

alter table businesses enable row level security;
alter table profiles enable row level security;
alter table business_members enable row level security;
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table inventory_movements enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table user_settings enable row level security;

-- Políticas para businesses
create policy "Los miembros ven su propio negocio"
on businesses for select
using (
  id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para profiles
create policy "Los usuarios ven su propio perfil"
on profiles for select
using (id = auth.uid());

create policy "Los usuarios actualizan su propio perfil"
on profiles for update
using (id = auth.uid());

-- Políticas para business_members
create policy "Los miembros ven miembros de su negocio"
on business_members for select
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para categorías
create policy "Los miembros ven categorías de su negocio"
on categories for all
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para proveedores
create policy "Los miembros ven proveedores de su negocio"
on suppliers for all
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para productos
create policy "Los miembros ven productos de su negocio"
on products for select
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

create policy "Los miembros crean productos en su negocio"
on products for insert
with check (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

create policy "Los miembros actualizan productos de su negocio"
on products for update
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para movimientos
create policy "Los miembros ven movimientos de su negocio"
on inventory_movements for select
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

create policy "Los miembros crean movimientos en su negocio"
on inventory_movements for insert
with check (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para notificaciones
create policy "Los usuarios ven notificaciones de su negocio"
on notifications for select
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

create policy "Los usuarios marcan sus notificaciones como leídas"
on notifications for update
using (
  business_id in (
    select business_id from business_members where user_id = auth.uid()
  )
);

-- Políticas para user_settings
create policy "Los usuarios gestionan su propia configuración"
on user_settings for all
using (user_id = auth.uid());

-- =============================================================================
-- 15. Datos de ejemplo (modo prueba - claramente identificados)
-- =============================================================================

-- Nota: estos datos son solo para pruebas de desarrollo.
-- En producción, eliminar o reemplazar con datos reales.

insert into businesses (name, ruc, email) values
  ('INVICORP Demo', '900123456', 'demo@invicorp.com')
on conflict do nothing;

-- El resto de datos de prueba se insertan desde la aplicación o scripts de seed.
