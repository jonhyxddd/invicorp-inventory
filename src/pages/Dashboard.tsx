import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, AlertCircle, PackageMinus, DollarSign, Activity } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import productService from "@/services/productService";
import movementService from "@/services/movementService";
import notificationService from "@/services/notificationService";
import { updateLastActivity } from "@/stores/authStore";

export function Dashboard() {
  const { user, business } = useAuthStore();
  const [stats, setStats] = useState<{
    total_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_inventory_value: number;
    today_movements: number;
  }>({
    total_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
    total_inventory_value: 0,
    today_movements: 0,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", business?.id],
    queryFn: () =>
      productService.list({ page: 1, pageSize: 100 }),
    enabled: !!business?.id,
  });

  useEffect(() => {
    if (products?.data) {
      const totalProducts = products.data.length;
      const lowStockCount = products.data.filter(
        (p: any) => p.stock_status === "low"
      ).length;
      const outOfStockCount = products.data.filter(
        (p: any) => p.stock_status === "out"
      ).length;
      const totalValue = products.data.reduce(
        (acc: number, p: any) => acc + (p.current_stock * p.cost_price),
        0
      );

      setStats({
        total_products: totalProducts,
        low_stock_products: lowStockCount,
        out_of_stock_products: outOfStockCount,
        total_inventory_value: totalValue,
        today_movements: 0,
      });
    }
  }, [products]);

  useEffect(() => {
    if (user?.id) {
      updateLastActivity(user.id);
    }
  }, [user?.id]);

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Panel de control</h1>
          <p className="text-invicorp-muted">
            Bienvenido, {user?.full_name || "Usuario"}{business ? ` - ${business.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="pl-9 pr-4 py-2 bg-invicorp-panel2 border border-invicorp-line rounded-full text-sm text-invicorp-text placeholder-invicorp-muted/60 focus:outline-none focus:border-invicorp-accent w-64"
            />
          </div>
          <button className="p-2 rounded-full text-invicorp-muted hover:text-invicorp-accent hover:bg-invicorp-line/50 transition-colors">
            <Activity className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-invicorp-accent to-invicorp-accent2 rounded-full flex items-center justify-center text-invicorp-dark text-sm font-bold shadow-glow">
            {(user?.full_name || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-invicorp-accent/40">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-invicorp-accent/10 flex items-center justify-center text-invicorp-accent shadow-glow">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-invicorp-muted font-medium">Total productos</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold text-invicorp-text">{stats.total_products}</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-invicorp-warn/40">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-invicorp-warn/10 flex items-center justify-center text-invicorp-warn">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium ${stats.low_stock_products > 0 ? "text-invicorp-danger" : "text-invicorp-success"}`}>
              {stats.low_stock_products > 0 ? "Requiere atención" : "Todo bien"}
            </span>
          </div>
          <p className="text-sm text-invicorp-muted font-medium">Stock bajo</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold text-invicorp-text">{stats.low_stock_products}</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-invicorp-danger/40">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-invicorp-danger/10 flex items-center justify-center text-invicorp-danger">
              <PackageMinus className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium ${stats.out_of_stock_products > 0 ? "text-invicorp-danger" : "text-invicorp-success"}`}>
              {stats.out_of_stock_products > 0 ? "Reponer urgente" : "OK"}
            </span>
          </div>
          <p className="text-sm text-invicorp-muted font-medium">Agotados</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold text-invicorp-text">{stats.out_of_stock_products}</span>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-invicorp-success/40">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-invicorp-success/10 flex items-center justify-center text-invicorp-success">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-invicorp-muted font-medium">Valor inventario</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold text-invicorp-text">${stats.total_inventory_value.toLocaleString("es-CO")}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-invicorp-text flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-invicorp-warn" />
          Alertas de stock
        </h2>
        <div className="space-y-3">
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-invicorp-panel border border-invicorp-line flex items-center justify-center">
                <Package className="w-5 h-5 text-invicorp-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-invicorp-text">Usa el módulo de Productos</p>
                <p className="text-xs text-invicorp-muted">Revisa productos con stock bajo o agotado</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-invicorp-muted">Consulta productos</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-invicorp-text mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-invicorp-accent" />
          Productos recientes
        </h2>
        <div className="glass-panel rounded-xl overflow-hidden">
          {loadingProducts ? (
            <div className="p-8 text-center text-invicorp-muted">Cargando...</div>
          ) : products?.data && products.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-invicorp-line">
                    <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Producto</th>
                    <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">SKU</th>
                    <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Stock actual</th>
                    <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Estado</th>
                    <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-invicorp-line">
                  {products.data.slice(0, 8).map((p: any) => (
                    <tr key={p.id} className="hover:bg-invicorp-line/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-invicorp-text">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-invicorp-muted">{p.sku}</td>
                      <td className="px-4 py-3 text-sm text-invicorp-text">{p.current_stock}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          p.stock_status === "ok"
                            ? "bg-invicorp-success/10 text-invicorp-success border border-invicorp-success/20"
                            : p.stock_status === "low"
                              ? "bg-invicorp-warn/10 text-invicorp-warn border border-invicorp-warn/20"
                              : "bg-invicorp-danger/10 text-invicorp-danger border border-invicorp-danger/20"
                        }`}
                        >
                          {p.stock_status === "ok" ? "OK" : p.stock_status === "low" ? "Bajo" : "Agotado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-invicorp-text">
                        ${(p.current_stock * p.cost_price).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-invicorp-muted">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No hay productos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
