import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthState, Profile, Business } from "@/types";
import { supabase } from "@/lib/supabaseClient";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      business: null,
      isAuthenticated: false,
      isLocked: true,
      isLoading: false,
      pinConfigured: false,

      setSession: (user: Profile, business: Business | null) => {
        set({
          user,
          business,
          isAuthenticated: true,
          isLocked: false,
          isLoading: false,
          pinConfigured: !!user.pin_hash,
        });
      },

      clearSession: () => {
        set({
          user: null,
          business: null,
          isAuthenticated: false,
          isLocked: true,
          isLoading: false,
          pinConfigured: false,
        });
      },

      setLocked: (locked: boolean) => {
        set({ isLocked: locked });
      },

      setPinConfigured: (configured: boolean) => {
        set({ pinConfigured: configured });
      },
    }),
    {
      name: "invicorp-auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        isAuthenticated: state.isAuthenticated,
        pinConfigured: state.pinConfigured,
      }),
    }
  )
);

// Verificar si el PIN está configurado para el usuario actual
export async function checkPinConfigured(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("pin_hash")
    .eq("id", userId)
    .single();

  if (error || !data) return false;
  return !!data.pin_hash;
}

// Actualizar última actividad
export async function updateLastActivity(userId: string): Promise<void> {
  await supabase.from("profiles").update({ last_activity_at: new Date().toISOString() }).eq("id", userId);
}
