import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { BarChart3, FileText, Download, Calendar, Search, Truck, PackageMinus, DollarSign } from "lucide-react";
import reportService from "@/services/reportService";

export function Reports() {
  const { business } = useAuthStore();
  const [reportType, setReportType] = useState<"inventory" | "low_stock" | "value" | "movements">("inventory");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["report-inventory", business?.id],
    queryFn: () => reportService.getInventory(business?.id || ""),
    enabled: !!business?.id,
  });

  const { data: lowStock } = useQuery({
    queryKey: ["report-low-stock", business?.id],
    queryFn: () => reportService.getLowStock(business?.id || ""),
    enabled: !!business?.id,
  });

  const { data: valueReport } = useQuery({
    queryKey: ["report-value", business?.id],
    queryFn: () => reportService.getInventoryValue(business?.id || ""),
    enabled: !!business?.id,
  });

  const reportTypes = [
    { value: "inventory" as const, label: "Inventario actual", icon: PackageMinus },
    { value: "low_stock" as const, label: "Stock bajo", icon: AlertCircleIcon },
    { value: "value" as const, label: "Valor del inventario", icon: DollarSign },
    { value: "movements" as const, label: "Historial de movimientos", icon: Truck },
  ];

  const exportCSV = () => {
    let data: any[] = [];
    let filename = "";

    if (reportType === "inventory") {
      data = (inventory || []).map((p: any) => ({
        SKU: p.sku,
        Producto: p.name,
        Categoría: p.categories?.name || "—",
        Stock: p.current_stock,
        Mínimo: p.min_stock,
        "Costo unitario": p.cost_price,
        "Precio venta": p.sale_price,
        "Valor total": p.current_stock * p.cost_price,
      }));
      filename = "inventario_actual";
    } else if (reportType === "low_stock") {
      data = (lowStock || []).map((p: any) => ({
        SKU: p.sku,
        Producto: p.name,
        Stock: p.current_stock,
        Mínimo: p.min_stock,
        Faltante: Math.max(0, p.min_stock - p.current_stock),
      }));
      filename = "productos_stock_bajo";
    }

    if (data.length > 0) {
      reportService.exportToCSV(data, filename);
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Reportes</h1>
          <p className="text-invicorp-muted">Genera y exporta reportes de inventario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex gap-4 mb-6 overflow-x-auto">
            {reportTypes.map((rt) => {
              const Icon = rt.icon;
              return (
                <button
                  key={rt.value}
                  onClick={() => setReportType(rt.value)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all min-w-[120px] ${
                    reportType === rt.value
                      ? "bg-invicorp-accent/10 border-invicorp-accent/50 text-invicorp-accent shadow-glow"
                      : "bg-invicorp-panel2 border-invicorp-line text-invicorp-muted hover:bg-invicorp-line/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{rt.label}</span>
                </button>
              );
            })}
          </div>

          {reportType === "value" && valueReport && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="glass-panel p-4 rounded-xl">
                <p className="text-xs text-invicorp-muted uppercase">Productos</p>
                <p className="text-xl font-bold text-invicorp-text">{valueReport.product_count}</p>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <p className="text-xs text-invicorp-muted uppercase">Valor de costo</p>
                <p className="text-xl font-bold text-invicorp-text">${valueReport.total_cost_value.toLocaleString("es-CO")}</p>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <p className="text-xs text-invicorp-muted uppercase">Valor de venta</p>
                <p className="text-xl font-bold text-invicorp-text">${valueReport.total_sale_value.toLocaleString("es-CO")}</p>
              </div>
            </div>
          )}

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-invicorp-panel2/50">
                  <tr>
                    {reportType === "inventory" && (
                      <>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">SKU</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Producto</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Categoría</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Stock</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Mínimo</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Valor costo</th>
                      </>
                    )}
                    {reportType === "low_stock" && (
                      <>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">SKU</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Producto</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Stock</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Mínimo</th>
                        <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Faltante</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-invicorp-line">
                  {(reportType === "inventory" ? inventory : lowStock)?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-invicorp-line/30 transition-colors">
                      {reportType === "inventory" && (
                        <>
                          <td className="px-4 py-3 text-sm text-invicorp-muted">{p.sku}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-text">{p.name}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-muted">{p.categories?.name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-text">{p.current_stock}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-muted">{p.min_stock}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-text">${(p.current_stock * p.cost_price).toLocaleString("es-CO")}</td>
                        </>
                      )}
                      {reportType === "low_stock" && (
                        <>
                          <td className="px-4 py-3 text-sm text-invicorp-muted">{p.sku}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-text">{p.name}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-text text-invicorp-warn">{p.current_stock}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-muted">{p.min_stock}</td>
                          <td className="px-4 py-3 text-sm text-invicorp-danger font-semibold">{Math.max(0, p.min_stock - p.current_stock)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-invicorp-text mb-4 uppercase tracking-wider">Exportar</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-invicorp-text">
                <Calendar className="w-4 h-4 text-invicorp-muted" />
                <span>Desde: <input type="date" className="ml-2 input-field w-24 py-1" /></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-invicorp-text">
                <Calendar className="w-4 h-4 text-invicorp-muted" />
                <span>Hasta: <input type="date" className="ml-2 input-field w-24 py-1" /></span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={exportCSV}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button
              className="w-full btn-secondary flex items-center justify-center gap-2 text-invicorp-accent border-invicorp-accent/30 hover:bg-invicorp-accent/10"
            >
              <FileText className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
