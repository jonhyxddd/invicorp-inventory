import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Search, Phone, Mail, MapPin, Edit3, Trash2 } from "lucide-react";
import supplierService from "@/services/supplierService";

export function Suppliers() {
  const navigate = useNavigate();
  const { business } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", business?.id],
    queryFn: () => supplierService.list({ page: 1, pageSize: 50 }),
    enabled: !!business?.id,
  });

  const suppliers = data?.data || [];

  if (isLoading) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-invicorp-accent/30 border-t-full rounded-full animate-spin mb-4" />
        <p className="text-invicorp-muted">Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="text-2xl font-bold text-invicorp-text">Proveedores</h1>
          <p className="text-invicorp-muted">Gestiona tus proveedores de mercancía</p>
        </div>
        <button
          onClick={() => navigate("/proveedores/nuevo")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo proveedor
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-invicorp-panel2/50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Proveedor</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Contacto</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Teléfono</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Correo</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-invicorp-muted uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-invicorp-line">
              {suppliers.length > 0 ? (
                suppliers.map((s: any) => (
                  <tr key={s.id} className="hover:bg-invicorp-line/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-invicorp-text">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-invicorp-text">{s.contact_person || "—"}</td>
                    <td className="px-4 py-3 text-sm text-invicorp-muted">
                      <Phone className="w-3 h-3 inline mr-1" /> {s.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-invicorp-muted">
                      <Mail className="w-3 h-3 inline mr-1" /> {s.email || "—"}
                    </td>
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
                  <td colSpan={6} className="px-4 py-12 text-center text-invicorp-muted">
                    <MapPin className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No hay proveedores registrados</p>
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
