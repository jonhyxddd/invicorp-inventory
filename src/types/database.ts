export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: string;
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
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          business_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          pin_hash?: string | null;
          pin_salt?: string | null;
          pin_attempts?: number;
          pin_locked_until?: string | null;
          last_pin_success?: string | null;
          last_activity_at?: string | null;
          auto_lock_minutes?: number;
          language?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          business_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          pin_hash?: string | null;
          pin_salt?: string | null;
          pin_attempts?: number;
          pin_locked_until?: string | null;
          last_pin_success?: string | null;
          last_activity_at?: string | null;
          auto_lock_minutes?: number;
          language?: string;
        };
      };
      businesses: {
        Row: {
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
        };
        Insert: {
          id: string;
          name: string;
          ruc?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          ruc?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id: string;
          business_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
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
        };
        Insert: {
          id: string;
          business_id: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
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
        };
        Insert: {
          id: string;
          business_id: string;
          category_id?: string | null;
          supplier_id?: string | null;
          sku: string;
          barcode?: string | null;
          name: string;
          description?: string | null;
          brand?: string | null;
          cost_price: number;
          sale_price: number;
          current_stock: number;
          min_stock: number;
          unit: string;
          location?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string | null;
          supplier_id?: string | null;
          sku?: string;
          barcode?: string | null;
          name?: string;
          description?: string | null;
          brand?: string | null;
          cost_price?: number;
          sale_price?: number;
          current_stock?: number;
          min_stock?: number;
          unit?: string;
          location?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          type: string;
          quantity: number;
          previous_stock: number;
          new_stock: number;
          reason: string | null;
          notes: string | null;
          reference: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id: string;
          business_id: string;
          product_id: string;
          type: string;
          quantity: number;
          previous_stock: number;
          new_stock: number;
          reason?: string | null;
          notes?: string | null;
          reference?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          product_id?: string;
          type?: string;
          quantity?: number;
          previous_stock?: number;
          new_stock?: number;
          reason?: string | null;
          notes?: string | null;
          reference?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          read_at: string | null;
          product_id: string | null;
          movement_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          business_id: string;
          user_id?: string | null;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          read_at?: string | null;
          product_id?: string | null;
          movement_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          read_at?: string | null;
          product_id?: string | null;
          movement_id?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          business_id: string;
          user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          language: string;
          notifications_enabled: boolean;
          auto_lock_minutes: number;
          low_stock_threshold_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          theme?: string;
          language?: string;
          notifications_enabled?: boolean;
          auto_lock_minutes?: number;
          low_stock_threshold_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          language?: string;
          notifications_enabled?: boolean;
          auto_lock_minutes?: number;
          low_stock_threshold_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      hash_pin: {
        Args: { pin: string; salt: string };
        Returns: string;
      };
      verify_pin: {
        Args: { pin: string; hash: string; salt: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
