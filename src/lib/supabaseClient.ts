import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[INVICORP] Variables de entorno Supabase no configuradas. Copia .env.example a .env y completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "");

// Canal de tiempo real para movimientos e inventario
export function subscribeToMovements(businessId: string, onChange: (payload: unknown) => void) {
  const channel = supabase
    .channel(`movements:${businessId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inventory_movements",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => onChange(payload)
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "inventory_movements",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => onChange(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToProducts(businessId: string, onChange: (payload: unknown) => void) {
  const channel = supabase
    .channel(`products:${businessId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => onChange(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export default supabase;
