import { describe, it, expect } from "vitest";
import * as z from "zod";

// Esquema de validación de producto (mismo que ProductForm)
const productSchema = z.object({
  sku: z.string().min(1, "El SKU es requerido"),
  barcode: z.string().nullable().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  cost_price: z.coerce.number().min(0, "El costo no puede ser negativo"),
  sale_price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  current_stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
  min_stock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo"),
  unit: z.string().min(1, "La unidad es requerida"),
});

describe("Validación de productos", () => {
  it("debe aceptar un producto válido", async () => {
    const data = {
      sku: "ABC-001",
      name: "Producto de prueba",
      cost_price: "1000",
      sale_price: "1500",
      current_stock: "10",
      min_stock: "2",
      unit: "unidad",
    };
    const result = productSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("debe rechazar SKU vacío", async () => {
    const result = productSchema.safeParse({
      sku: "",
      name: "Producto",
      cost_price: 0,
      sale_price: 0,
      current_stock: 0,
      min_stock: 0,
      unit: "unidad",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain("sku");
    }
  });

  it("debe rechazar stock negativo", async () => {
    const result = productSchema.safeParse({
      sku: "ABC-001",
      name: "Producto",
      cost_price: 0,
      sale_price: 0,
      current_stock: -5,
      min_stock: 0,
      unit: "unidad",
    });
    expect(result.success).toBe(false);
  });

  it("debe rechazar precio negativo", async () => {
    const result = productSchema.safeParse({
      sku: "ABC-001",
      name: "Producto",
      cost_price: -100,
      sale_price: 0,
      current_stock: 0,
      min_stock: 0,
      unit: "unidad",
    });
    expect(result.success).toBe(false);
  });

  it("debe rechazar nombre vacío", async () => {
    const result = productSchema.safeParse({
      sku: "ABC-001",
      name: "",
      cost_price: 0,
      sale_price: 0,
      current_stock: 0,
      min_stock: 0,
      unit: "unidad",
    });
    expect(result.success).toBe(false);
  });
});
