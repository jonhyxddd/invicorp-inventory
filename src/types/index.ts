export type Role = "administrador" | "supervisor" | "operador";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: Role;
  business_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pin_hash: string | null;
  pin_salt: string | null;
  pin_attempts: number;
  pin_locked_until: string | null;
  last_pin_success: string | null;
  last_activity_at: string | null;
  auto_lock_minutes: number;
  language: string;
}

export interface Business {
  id: string;
  name: string;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  supplier_id: string | null;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  brand: string | null;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock: number;
  unit: string;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  category?: Category;
  supplier?: Supplier;
  stock_status?: "ok" | "low" | "out";
  stock_value?: number;
}

export interface InventoryMovement {
  id: string;
  business_id: string;
  product_id: string;
  type: "entrada" | "salida" | "ajuste" | "devolucion" | "correccion";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  notes: string | null;
  reference: string | null;
  created_at: string;
  created_by: string;
  product?: Product;
}

export interface Notification {
  id: string;
  business_id: string;
  user_id: string | null;
  type: "stock_bajo" | "stock_agotado" | "entrada" | "salida" | "ajuste" | "administrativo";
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  product_id: string | null;
  movement_id: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  business_id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  auto_lock_minutes: number;
  low_stock_threshold_percent: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MovementFormData {
  product_id: string;
  type: InventoryMovement["type"];
  quantity: number;
  reason: string | null;
  notes: string | null;
  reference: string | null;
}

export interface ProductFormData {
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  category_id: string | null;
  supplier_id: string | null;
  brand: string | null;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock: number;
  unit: string;
  location: string | null;
  image_file: File | null;
  is_active: boolean;
}

export interface SupplierFormData {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
}

export interface PinSetupData {
  pin: string;
  confirmPin: string;
}

export interface PinUnlockData {
  pin: string;
}

export interface AuthState {
  user: Profile | null;
  business: Business | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  pinConfigured: boolean;
  setSession: (user: Profile, business: Business | null) => void;
  clearSession: () => void;
  setLocked: (locked: boolean) => void;
  setPinConfigured: (configured: boolean) => void;
}

export interface OfflineQueueItem {
  id: string;
  type: "product_create" | "product_update" | "product_delete" | "movement_create" | "supplier_create" | "supplier_update" | "category_create" | "category_update";
  payload: unknown;
  timestamp: string;
  retries: number;
}

export interface DashboardStats {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_inventory_value: number;
  recent_movements: InventoryMovement[];
  today_movements: number;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  product_id?: string;
  category_id?: string;
  supplier_id?: string;
  movement_type?: InventoryMovement["type"];
}
