import { supabase } from "@/lib/supabaseClient";
import type { Category, CategoryFormData, PaginationParams, PaginatedResponse } from "@/types";

const TABLE = "categories";

const categoryService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<Category>> {
    const { page = 1, pageSize = 20, search } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(TABLE).select("*", { count: "exact" }).eq("is_active", true);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as Category[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async get(id: string): Promise<Category | null> {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Category;
  },

  async create(data: CategoryFormData, businessId: string): Promise<Category> {
    const { data: newCategory, error } = await supabase
      .from(TABLE)
      .insert({ ...data, business_id: businessId })
      .select()
      .single();
    if (error) throw error;
    return newCategory as Category;
  },

  async update(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated as Category;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },

  async getForSelect(businessId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, name, icon, color")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return (data || []) as Category[];
  },
};

export default categoryService;
export { categoryService };
