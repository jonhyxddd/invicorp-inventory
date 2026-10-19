import { supabase } from "@/lib/supabaseClient";
import type { Product, InventoryMovement } from "@/types";

const reportService = {
  async getInventory(businessId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`*, categories(name), suppliers(name)`)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return (data || []) as Product[];
  },

  async getLowStock(businessId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`*, categories(name)`)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .filter("current_stock", "lte", "min_stock")
      .order("current_stock", { ascending: true });

    if (error) throw error;
    return (data || []) as Product[];
  },

  async getInventoryValue(businessId: string): Promise<{
    total_value: number;
    total_cost_value: number;
    total_sale_value: number;
    product_count: number;
  }> {
    const { data, error } = await supabase
      .from("products")
      .select("current_stock, cost_price, sale_price")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (error) throw error;

    const products = data || [];
    let totalCostValue = 0;
    let totalSaleValue = 0;

    for (const p of products) {
      totalCostValue += (p as any).current_stock * (p as any).cost_price;
      totalSaleValue += (p as any).current_stock * (p as any).sale_price;
    }

    return {
      total_value: totalSaleValue,
      total_cost_value: totalCostValue,
      total_sale_value: totalSaleValue,
      product_count: products.length,
    };
  },

  async getMovements(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<InventoryMovement[]> {
    const { data, error } = await supabase
      .from("inventory_movements")
      .select(`*, products(name, sku)`)
      .eq("business_id", businessId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as InventoryMovement[];
  },

  async getTopMovements(businessId: string, limit = 10): Promise<{
    product_id: string;
    product_name: string;
    sku: string;
    total_quantity: number;
    movement_count: number;
  }[]> {
    const { data, error } = await supabase
      .from("inventory_movements")
      .select("product_id, quantity, products(name, sku)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const movements = data || [];
    const aggregated: Record<string, { product_name: string; sku: string; total_quantity: number; movement_count: number }> = {};

    for (const m of movements) {
      const pid = m.product_id;
      if (!aggregated[pid]) {
        aggregated[pid] = {
          product_name: (m as any).products?.name || "Desconocido",
          sku: (m as any).products?.sku || "",
          total_quantity: 0,
          movement_count: 0,
        };
      }
      aggregated[pid].total_quantity += Math.abs((m as any).quantity);
      aggregated[pid].movement_count += 1;
    }

    return Object.entries(aggregated)
      .map(([product_id, v]) => ({ product_id, ...v }))
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  },

  exportToCSV(data: unknown[], filename: string): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0] as Record<string, unknown>);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = (row as Record<string, unknown>)[h];
            const str = String(val ?? "");
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default reportService;
export { reportService };
