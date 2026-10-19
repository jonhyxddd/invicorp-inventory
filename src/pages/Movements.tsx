import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Activity } from "lucide-react";
import movementService from "@/services/movementService";
import type { InventoryMovement } from "@/types";

export function Movements() {
  const navigate = useNavigate();
  const { business } = useAuthStore();
  const [typeFilter, setTypeFilter] = React.useState<"all" | "entrada" | "salida" | "ajuste" | "devolucion" | "correccion">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["movements", business?.id, typeFilter],
    queryFn: () => movementService.list({ page: 1, pageSize: 50 }),
    enabled: !!business?.id,
  });

  const movements: InventoryMovement[] = data?.data || [];

  const movementTypes: Array<"all" | "entrada" | "salida" | "ajuste" | "devolucion" | "correccion"> = [
    "all", "entrada", "salida", "ajuste", "devolucion", "correccion",
  ];

  const filteredMovements = typeFilter === "all"
    ? movements
    : movements.filter((m) => m.type === typeFilter);

  const typeLabels: Record<string, { label: string; color: string }> = {
    entrada: { label: "Entrada", color: "text-invicorp-success" },
    salida: { label: "Salida", color: "text-invicorp-danger" },
    ajuste: { label: "Ajuste", color: "text-invicorp-warn" },
    devolucion: { label: "Devolución", color: "text-invicorp-accent2" },
    correccion: { label: "Corrección", color: "text-invicorp-accent" },
  };

  if (isLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-invicorp-accent/30 border-t-full rounded-full animate-spin mb-4" />
        <p className="text-invicorp-muted">Cargando movimientos...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Movimientos de inventario</h1>
          <p className="text-invicorp-muted">Historial de entradas, salidas y ajustes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/movimientos/nueva")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo movimiento
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {movementTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === t
                ? "bg-invicorp-accent text-invicorp-dark border-invicorp-accent"
                : "bg-invicorp-panel2 text-invicorp-muted border-invicorp-line hover:bg-invicorp-line/50"
            }`}
          >
            {t === "all" ? "Todos" : typeLabels[t].label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-invicorp-panel2/50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Fecha</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Producto</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Tipo</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Cantidad</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Stock anterior</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Stock nuevo</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-invicorp-line">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((m: InventoryMovement & { products?: { name: string; sku: string } }) => (
                  <tr key={m.id} className="hover:bg-invicorp-line/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-invicorp-text">
                      {new Date(m.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-sm text-invicorp-text">
                      {m.products?.name || "Producto"} <br />
                      <span className="text-xs text-invicorp-muted">{m.products?.sku || ""}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${typeLabels[m.type].color}`}>
                        {typeLabels[m.type].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-invicorp-text font-mono">
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-invicorp-muted">{m.previous_stock}</td>
                    <td className="px-4 py-3 text-sm text-invicorp-text font-semibold">{m.new_stock}</td>
                    <td className="px-4 py-3 text-sm text-invicorp-muted">{m.created_by}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-invicorp-muted">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No hay movimientos registrados</p>
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
