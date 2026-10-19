import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Search, Filter, Package, AlertCircle, PackageMinus } from "lucide-react";
import productService from "@/services/productService";
import notificationService from "@/services/notificationService";
import type { Product } from "@/types";

export function Products() {
  const navigate = useNavigate();
  const { business, user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["products", business?.id, search, page],
    queryFn: () => productService.list({ page, pageSize: 20, search }),
    enabled: !!business?.id,
  });

  useEffect(() => {
    if (user?.id && business?.id) {
      productService.getLowStock(business.id).then((low) => {
        low.forEach((p: any) => {
          notificationService.create({
            business_id: business.id,
            user_id: user.id,
            type: p.current_stock === 0 ? "stock_agotado" : "stock_bajo",
            title: p.current_stock === 0 ? "Producto agotado" : "Stock bajo",
            message: `${p.name} tiene ${p.current_stock} unidad(es) en stock (mínimo: ${p.min_stock})`,
            product_id: p.id,
          });
        });
      });
    }
  }, [user?.id, business?.id]);

  if (isLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-invicorp-accent/30 border-t-full rounded-full animate-spin mb-4" />
        <p className="text-invicorp-muted">Cargando productos...</p>
      </div>
    );
  }

  const products: Product[] = data?.data || [];

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Productos</h1>
          <p className="text-invicorp-muted">Gestiona el catálogo de productos de {business?.name || "tu negocio"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/productos/nuevo")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text placeholder-invicorp-muted/60 focus:outline-none focus:border-invicorp-accent"
            />
          </div>
          <button className="px-4 py-3 bg-invicorp-panel2 border border-invicorp-line text-invicorp-text rounded-xl hover:bg-invicorp-line/50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map((p) => (
            <div
              key={p.id}
              className="glass-panel p-4 rounded-xl hover:border-invicorp-accent/50 transition-all duration-200 group cursor-pointer"
              onClick={() => navigate(`/productos/${p.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-invicorp-panel border border-invicorp-line flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-invicorp-muted" />
                  )}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  p.stock_status === "ok"
                    ? "bg-invicorp-success/10 text-invicorp-success border border-invicorp-success/20"
                    : p.stock_status === "low"
                      ? "bg-invicorp-warn/10 text-invicorp-warn border border-invicorp-warn/20"
                      : "bg-invicorp-danger/10 text-invicorp-danger border border-invicorp-danger/20"
                }`}
                >
                  {p.stock_status === "ok" ? "OK" : p.stock_status === "low" ? "Bajo" : "Sin stock"}
                </span>
              </div>
              <h3 className="font-bold text-invicorp-text text-sm mb-1">{p.name}</h3>
              <p className="text-xs text-invicorp-muted mb-3">SKU: {p.sku}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-invicorp-muted">Stock:</span>
                <span className="text-sm font-semibold text-invicorp-text">{p.current_stock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-invicorp-muted">Precio:</span>
                <span className="text-sm font-semibold text-invicorp-text">$${Number(p.sale_price).toLocaleString("es-CO")}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center rounded-3xl border-2 border-dashed border-invicorp-line/50 bg-invicorp-panel2/50">
            <Package className="w-12 h-12 text-invicorp-muted/30 mb-4" />
            <h3 className="text-invicorp-text font-semibold mb-2">No hay productos</h3>
            <p className="text-invicorp-muted text-sm">Comienza creando tu primer producto</p>
            <button
              onClick={() => navigate("/productos/nuevo")}
              className="mt-4 btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Crear producto
            </button>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-invicorp-text hover:bg-invicorp-line/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-invicorp-muted">Página {page} de {data.totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 rounded-lg text-invicorp-text hover:bg-invicorp-line/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
