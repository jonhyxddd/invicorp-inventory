import { supabase } from "@/lib/supabaseClient";
import { offlineDb } from "@/lib/storage";
import { isNetworkOnline } from "@/lib/network";
import type { InventoryMovement, MovementFormData, PaginationParams, PaginatedResponse } from "@/types";

const TABLE = "inventory_movements";

const movementService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<InventoryMovement>> {
    const { page = 1, pageSize = 20, sortBy = "created_at", sortOrder = "desc" } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select(`*, products(name, sku, barcode)`, { count: "exact" })
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data || []) as InventoryMovement[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async getByProduct(productId: string): Promise<InventoryMovement[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as InventoryMovement[];
  },

  async create(formData: MovementFormData, userId: string, businessId: string): Promise<InventoryMovement> {
    const { data: product, error: prodError } = await supabase
      .from("products")
      .select("current_stock")
      .eq("id", formData.product_id)
      .single();

    if (prodError) throw prodError;
    const previousStock = product.current_stock;

    const qty = Math.max(0, Number(formData.quantity) || 0);
    let newStock: number;

    switch (formData.type) {
      case "entrada":
        newStock = previousStock + qty;
        break;
      case "salida":
        if (previousStock - qty < 0) {
          throw new Error("No hay suficiente stock para esta salida");
        }
        newStock = previousStock - qty;
        break;
      case "ajuste":
        newStock = qty;
        break;
      case "devolucion":
        newStock = previousStock + qty;
        break;
      case "correccion":
        newStock = qty;
        break;
      default:
        newStock = previousStock;
    }

    const movementData: any = {
      business_id: businessId,
      product_id: formData.product_id,
      type: formData.type,
      quantity: qty,
      previous_stock: previousStock,
      new_stock: newStock,
      reason: formData.reason,
      notes: formData.notes,
      reference: formData.reference,
      created_by: userId,
    };

    try {
      const { data: movement, error } = await supabase.rpc("record_movement", {
        p_business_id: businessId,
        p_product_id: formData.product_id,
        p_type: formData.type,
        p_quantity: qty,
        p_previous_stock: previousStock,
        p_new_stock: newStock,
        p_reason: formData.reason,
        p_notes: formData.notes,
        p_reference: formData.reference,
        p_created_by: userId,
      });

      if (error) throw error;
      return movement[0];
    } catch (rpcError) {
      const { data: directMovement, error: directError } = await supabase
        .from(TABLE)
        .insert(movementData)
        .select()
        .single();

      if (directError) throw directError;

      const { error: updateError } = await supabase
        .from("products")
        .update({ current_stock: newStock, updated_by: userId, updated_at: new Date().toISOString() })
        .eq("id", formData.product_id);

      if (updateError) throw updateError;

      if (!isNetworkOnline()) {
        await offlineDb.queueAdd({
          id: `mov_create_${Date.now()}`,
          type: "movement_create",
          payload: movementData,
          timestamp: new Date().toISOString(),
          retries: 0,
        });
      }

      return directMovement;
    }
  },

  async getStats(businessId: string): Promise<{
    today_entries: number;
    today_exits: number;
    today_value: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .select("type, quantity, created_at")
      .eq("business_id", businessId)
      .gte("created_at", todayStr);

    if (error) throw error;

    const movements = data || [];
    const todayEntries = movements.filter((m: any) => m.type === "entrada").length;
    const todayExits = movements.filter((m: any) => m.type === "salida").length;

    return { today_entries: todayEntries, today_exits: todayExits, today_value: 0 };
  },
};

export default movementService;
export { movementService };
