import { supabase } from "@/lib/supabaseClient";
import type { Notification, PaginationParams, PaginatedResponse } from "@/types";

const TABLE = "notifications";

const notificationService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<Notification>> {
    const { page = 1, pageSize = 20 } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as Notification[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE)
      .select("*", { head: true, count: "exact" })
      .eq("is_read", false);

    if (error) throw error;
    return count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("is_read", false);

    if (error) throw error;
  },

  async create(data: {
    business_id: string;
    user_id?: string | null;
    type: Notification["type"];
    title: string;
    message: string;
    product_id?: string | null;
    movement_id?: string | null;
  }): Promise<void> {
    const { error } = await supabase.from(TABLE).insert(data);
    if (error) throw error;
  },
};

export default notificationService;
export { notificationService };
