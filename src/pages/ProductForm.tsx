import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Save, Plus, Image, Trash2, AlertTriangle } from "lucide-react";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import supplierService from "@/services/supplierService";

const productSchema = z.object({
  sku: z.string().min(1, "El SKU es requerido"),
  barcode: z.string().nullable().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  supplier_id: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  cost_price: z.coerce.number().min(0, "El costo no puede ser negativo"),
  sale_price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  current_stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
  min_stock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo"),
  unit: z.string().min(1, "La unidad es requerida"),
  location: z.string().nullable().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof productSchema>;

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { business, user } = useAuthStore();
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      barcode: "",
      name: "",
      description: "",
      category_id: null,
      supplier_id: null,
      brand: "",
      cost_price: 0,
      sale_price: 0,
      current_stock: 0,
      min_stock: 0,
      unit: "unidad",
      location: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (business?.id) {
      categoryService.getForSelect(business.id).then(setCategories);
      supplierService.getForSelect(business.id).then(setSuppliers);
    }
    if (id) {
      setIsEdit(true);
    }
  }, [id, business?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: any = {
        ...data,
        image_file: imageFile,
      };

      if (isEdit && id) {
        await productService.update(id, payload, user?.id || "");
      } else {
        await productService.create(payload, user?.id || "", business?.id || "");
      }

      navigate("/productos");
    } catch (err: any) {
      alert(err.message || "Error guardando producto");
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/productos")}
          className="flex items-center gap-2 text-invicorp-accent hover:text-invicorp-accent/80 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-2xl font-bold text-invicorp-text">
          {isEdit ? "Editar producto" : "Nuevo producto"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Nombre del producto</label>
              <input {...register("name")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" />
              {errors.name && <p className="text-xs text-invicorp-danger mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">SKU</label>
              <input {...register("sku")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" />
              {errors.sku && <p className="text-xs text-invicorp-danger mt-1">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Código de barras</label>
              <input {...register("barcode")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Opcional" />
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Marca</label>
              <input {...register("brand")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Opcional" />
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Categoría</label>
              <select {...register("category_id")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent">
                <option value="">Seleccionar categoría</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Proveedor</label>
              <select {...register("supplier_id")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent">
                <option value="">Seleccionar proveedor</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Costo unitario</label>
              <input type="number" {...register("cost_price")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" step="0.01" min="0" />
              {errors.cost_price && <p className="text-xs text-invicorp-danger mt-1">{errors.cost_price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Precio de venta</label>
              <input type="number" {...register("sale_price")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" step="0.01" min="0" />
              {errors.sale_price && <p className="text-xs text-invicorp-danger mt-1">{errors.sale_price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Stock actual</label>
              <input type="number" {...register("current_stock")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" step="1" min="0" />
              {errors.current_stock && <p className="text-xs text-invicorp-danger mt-1">{errors.current_stock.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Stock mínimo</label>
              <input type="number" {...register("min_stock")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" step="1" min="0" />
              {errors.min_stock && <p className="text-xs text-invicorp-danger mt-1">{errors.min_stock.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Unidad de medida</label>
              <input {...register("unit")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" defaultValue="unidad" />
            </div>

            <div>
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Ubicación física</label>
              <input {...register("location")} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Ej: Estante A-1" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-invicorp-muted mb-1">Descripción</label>
              <textarea {...register("description")} rows={3} className="w-full px-4 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text focus:outline-none focus:border-invicorp-accent" placeholder="Opcional" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-invicorp-muted mb-1 flex items-center gap-2">
                <Image className="w-4 h-4" /> Fotografía del producto
              </label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={handleImageChange}
                  className="flex-1 py-3 bg-invicorp-panel2 border border-invicorp-line rounded-xl text-invicorp-text hover:bg-invicorp-line/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Seleccionar imagen
                </button>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview && (
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-invicorp-line" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="text-invicorp-danger hover:text-invicorp-danger/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-3 mt-2">
              <input
                id="is_active"
                {...register("is_active")}
                type="checkbox"
                className="w-4 h-4 rounded border-invicorp-line text-invicorp-accent focus:ring-invicorp-accent bg-invicorp-panel2"
              />
              <label htmlFor="is_active" className="text-sm text-invicorp-text">
                Producto activo
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4 mr-2" /> Guardar producto
            </button>
          </div>
        </form>

        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-invicorp-text mb-4 uppercase tracking-wider">Información</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-invicorp-panel2 border border-invicorp-line">
              <div className="w-8 h-8 rounded-lg bg-invicorp-accent/10 flex items-center justify-center text-invicorp-accent">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-invicorp-text">Validación de stock</p>
                <p className="text-xs text-invicorp-muted">No se permiten cantidades negativas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-invicorp-panel2 border border-invicorp-line">
              <div className="w-8 h-8 rounded-lg bg-invicorp-accent/10 flex items-center justify-center text-invicorp-accent">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-invicorp-text">SKU único</p>
                <p className="text-xs text-invicorp-muted">Cada producto debe tener un SKU único</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
