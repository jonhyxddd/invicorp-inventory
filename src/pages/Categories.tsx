import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Search, Tag, Edit3, Trash2 } from "lucide-react";
import categoryService from "@/services/categoryService";

export function Categories() {
  const navigate = useNavigate();
  const { business } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["categories", business?.id],
    queryFn: () => categoryService.list({ page: 1, pageSize: 50 }),
    enabled: !!business?.id,
  });

  const categories = data?.data || [];

  if (isLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-invicorp-accent/30 border-t-full rounded-full animate-spin mb-4" />
        <p className="text-invicorp-muted">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Categorías</h1>
          <p className="text-invicorp-muted">Organiza tus productos por categorías</p>
        </div>
        <button
          onClick={() => navigate("/categorias/nueva")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-invicorp-panel2/50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Categoría</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Descripción</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-invicorp-line">
              {categories.length > 0 ? (
                categories.map((c: any) => (
                  <tr key={c.id} className="hover:bg-invicorp-line/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-invicorp-text">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.color || "#38bdf8", color: "#000" }}>
                          {c.icon || "T"}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-invicorp-muted">{c.description || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-invicorp-success/10 text-invicorp-success border border-invicorp-success/20">
                        Activo
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-2 text-invicorp-accent hover:text-invicorp-accent/80">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-invicorp-danger hover:text-invicorp-danger/80">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-invicorp-muted">
                    <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No hay categorías registradas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
