import { supabase } from "@/lib/supabaseClient";
import type { Profile, PaginationParams, PaginatedResponse } from "@/types";

const TABLE = "profiles";

const userService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<Profile>> {
    const { page = 1, pageSize = 20, search } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(TABLE).select("*, businesses(name)", { count: "exact" });

    if (search) {
      query = query.ilike("full_name", `%${search}%`).or(`email.ilike.%${search}%`);
    }

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as Profile[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async get(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Profile;
  },

  async updateRole(id: string, role: Profile["role"]): Promise<Profile> {
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated as Profile;
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async activate(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async updatePin(userId: string, pinHash: string, pinSalt: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({
        pin_hash: pinHash,
        pin_salt: pinSalt,
        pin_attempts: 0,
        pin_locked_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
  },

  async recordFailedAttempt(userId: string): Promise<void> {
    const { data: user } = await supabase.from(TABLE).select("pin_attempts").eq("id", userId).single();
    const attempts = ((user as any)?.pin_attempts ?? 0) + 1;

    let lockedUntil: string | null = null;
    if (attempts >= 5) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      lockedUntil = lockUntil.toISOString();
    }

    const { error } = await supabase
      .from(TABLE)
      .update({
        pin_attempts: attempts,
        pin_locked_until: lockedUntil,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
  },

  async resetAttempts(userId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({
        pin_attempts: 0,
        pin_locked_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
  },

  async getForSelect(businessId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, full_name, role, email")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("full_name");

    if (error) throw error;
    return (data || []) as Profile[];
  },
};

export default userService;
export { userService };
