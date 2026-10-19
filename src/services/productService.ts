import { supabase } from "@/lib/supabaseClient";
import { offlineDb } from "@/lib/storage";
import { isNetworkOnline } from "@/lib/network";
import type { Product, ProductFormData, PaginationParams, PaginatedResponse } from "@/types";

const TABLE = "products";

const productService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const { page = 1, pageSize = 20, search, sortBy = "updated_at", sortOrder = "desc" } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(TABLE)
      .select(`*, categories(name, icon, color), suppliers(name)`, { count: "exact" })
      .eq("is_active", true)
      .order(sortBy, { ascending: sortOrder === "asc" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const enriched = (data || []).map((p: any) => ({
      ...p,
      stock_status: p.current_stock === 0 ? "out" : p.current_stock <= p.min_stock ? "low" : "ok",
      stock_value: Math.round(p.current_stock * p.cost_price * 100) / 100,
    }));

    return {
      data: enriched,
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async get(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`*, categories(*), suppliers(*)`)
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return {
      ...data,
      stock_status: data.current_stock === 0 ? "out" : data.current_stock <= data.min_stock ? "low" : "ok",
      stock_value: Math.round(data.current_stock * data.cost_price * 100) / 100,
    } as Product;
  },

  async create(data: ProductFormData, userId: string, businessId: string): Promise<Product> {
    const { image_file, ...rest } = data as any;
    let imageUrl: string | null = null;
    if (image_file) {
      imageUrl = await uploadProductImage(image_file, businessId);
    }

    const insertData: any = {
      ...rest,
      business_id: businessId,
      image_url: imageUrl,
      created_by: userId,
      updated_by: userId,
      current_stock: Math.max(0, Number(rest.current_stock) || 0),
    };

    const { data: newProduct, error } = await supabase.from(TABLE).insert(insertData).select().single();
    if (error) throw error;

    if (!isNetworkOnline()) {
      await offlineDb.queueAdd({
        id: `prod_create_${Date.now()}`,
        type: "product_create",
        payload: insertData,
        timestamp: new Date().toISOString(),
        retries: 0,
      });
    }
    return newProduct;
  },

  async update(id: string, data: Partial<ProductFormData>, userId: string): Promise<Product> {
    const { image_file, ...rest } = data as any;
    let imageUrl: string | undefined;
    if (image_file) {
      const product = await this.get(id);
      if (product?.business_id) {
        imageUrl = await uploadProductImage(image_file, product.business_id);
      }
    }

    const updateData: any = {
      ...rest,
      ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    if (!isNetworkOnline()) {
      await offlineDb.queueAdd({
        id: `prod_update_${Date.now()}`,
        type: "product_update",
        payload: { id, ...updateData },
        timestamp: new Date().toISOString(),
        retries: 0,
      });
    }
    return updated;
  },

  async archive(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ is_active: false, updated_by: userId, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },

  async search(query: string, limit = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, sku, barcode, name, current_stock, min_stock, sale_price, image_url")
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
      .limit(limit);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      stock_status: p.current_stock === 0 ? "out" : p.current_stock <= p.min_stock ? "low" : "ok",
    }));
  },

  async getLowStock(businessId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`*, categories(name, icon, color)`)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .filter("current_stock", "lte", "min_stock");
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      stock_status: p.current_stock === 0 ? "out" : "low",
      stock_value: Math.round(p.current_stock * p.cost_price * 100) / 100,
    }));
  },

  async getOutOfStock(businessId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`*, categories(name, icon, color)`)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .eq("current_stock", 0);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      stock_status: "out",
      stock_value: 0,
    }));
  },
};

async function uploadProductImage(file: File, businessId: string): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${businessId}/${crypto.randomUUID()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    console.error("Error subiendo imagen:", uploadError);
    return null;
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

export default productService;
export { productService };
