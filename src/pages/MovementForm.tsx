import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Save, Truck, RotateCcw, Plus, Minus } from "lucide-react";
import productService from "@/services/productService";
import movementService from "@/services/movementService";

const movementSchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  type: z.enum(["entrada", "salida", "ajuste", "devolucion", "correccion"]),
  quantity: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().optional(),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

type FormValues = z.infer<typeof movementSchema>;

type MovementType = {
  value: "entrada" | "salida" | "ajuste" | "devolucion" | "correccion";
  label: string;
  icon: React.ElementType;
  color: string;
};

const MOVEMENT_TYPES: MovementType[] = [
  { value: "entrada", label: "Entrada de mercancía", icon: Truck, color: "invicorp-success" },
  { value: "salida", label: "Salida de mercancía", icon: ArrowLeft, color: "invicorp-danger" },
  { value: "ajuste", label: "Ajuste de existencias", icon: RotateCcw, color: "invicorp-warn" },
  { value: "devolucion", label: "Devolución", icon: Truck, color: "invicorp-accent2" },
  { value: "correccion", label: "Corrección de inventario", icon: RotateCcw, color: "invicorp-accent" },
];

export function MovementForm() {
  const navigate = useNavigate();
  const { business, user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentStock, setCurrentStock] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: "",
      type: "entrada",
      quantity: 1,
      reason: "",
      notes: "",
      reference: "",
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (business?.id) {
      productService.list({ page: 1, pageSize: 100 }).then((res: any) => {
        setProducts(res.data);
      });
    }
  }, [business?.id]);

  const handleProductChange = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (p) {
      setSelectedProduct(p);
      setCurrentStock(p.current_stock);
      setValue("product_id", p.id);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await movementService.create(data, user?.id || "", business?.id || "");
      navigate("/movimientos");
    } catch (err: any) {
      alert(err.message || "Error registrando movimiento");
    }
  };

  const qty = Number(watch("quantity")) || 0;
  const projected =
    type === "entrada" || type === "devolucion"
      ? currentStock + qty
      : type === "salida"
        ? Math.max(0, currentStock - qty)
        : qty;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/movimientos")}
          className="flex items-center gap-2 text-invicorp-accent hover:text-invicorp-accent/80 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-2xl font-bold text-invicorp-text">Nuevo movimiento</h1>
      </div>

      <div className="glass-panel p-6 rounded-2xl max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-invicorp-muted mb-2">Tipo de movimiento</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MOVEMENT_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setValue("type", mt.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    type === mt.value
                      ? `bg-${mt.color}/10 border-${mt.color}/50 text-${mt.color} shadow-glow`
                      : "bg-invicorp-panel2 border-invicorp-line text-invicorp-muted hover:bg-invicorp-line/50"
                  }`}
                >
                  <mt.icon className={`w-5 h-5 ${type === mt.value ? `text-${mt.color}` : "text-invicorp-muted"}`} />
                  <span className="text-xs font-medium">{mt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-invicorp-muted mb-2">Producto</label>
            <select
              {...register("product_id")}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProductChange(e.target.value)}
              className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent"
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            {errors.product_id && <p className="text-xs text-invicorp-danger mt-1">{errors.product_id.message}</p>}
          </div>

          {selectedProduct && (
            <div className="bg-invicorp-panel2/50 rounded-xl p-4 border border-invicorp-line/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-invicorp-muted">Stock actual:</span>
                <span className="text-sm font-semibold text-invicorp-text">{currentStock}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-invicorp-muted">Después del movimiento:</span>
                <span className="text-sm font-bold text-invicorp-text">{projected}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-invicorp-muted mb-2">Cantidad</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValue("quantity", Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-xl bg-invicorp-panel2 border border-invicorp-line flex items-center justify-center text-invicorp-text hover:bg-invicorp-line/50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                {...register("quantity")}
                className="w-20 h-10 text-center text-invicorp-text bg-invicorp-panel2 border border-invicorp-line rounded-xl focus:outline-none focus:border-invicorp-accent"
              />
              <button
                type="button"
                onClick={() => setValue("quantity", qty + 1)}
                className="w-10 h-10 rounded-xl bg-invicorp-panel2 border border-invicorp-line flex items-center justify-center text-invicorp-text hover:bg-invicorp-line/50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {errors.quantity && <p className="text-xs text-invicorp-danger mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-invicorp-muted mb-2">Motivo</label>
            <input {...register("reason")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Ej: Compra mensual, ajuste físico..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-invicorp-muted mb-2">Observaciones (opcional)</label>
            <textarea {...register("notes")} rows={3} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Notas adicionales..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-invicorp-muted mb-2">Referencia (opcional)</label>
            <input {...register("reference")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Factura #, remisión..." />
          </div>

          <button type="submit" className="btn-primary w-full py-3">
            <Save className="w-4 h-4 mr-2" /> Registrar movimiento
          </button>
        </form>
      </div>
    </div>
  );
}
