import React from "react";
import { ChevronUp, ChevronDown, AlertCircle, PackageMinus, DollarSign, Activity } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  color?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color = "invicorp-accent",
  onClick,
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-invicorp-success"
      : changeType === "negative"
        ? "text-invicorp-danger"
        : "text-invicorp-muted";

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-2xl cursor-pointer hover:border-invicorp-accent/50 transition-all duration-200 ${
        onClick ? "hover:shadow-glow" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-${color} bg-${color}/10 shadow-glow`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-xs font-medium ${changeColor}`}>
            {changeType === "positive" ? <ChevronUp className="w-3 h-3 inline" /> : changeType === "negative" ? <ChevronDown className="w-3 h-3 inline" /> : null}
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-invicorp-muted font-medium">{title}</p>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-2xl font-bold text-invicorp-text">{value}</span>
      </div>
    </div>
  );
}

export const statConfigs = {
  total_products: {
    title: "Total productos",
    icon: Package,
    color: "invicorp-accent",
  },
  low_stock: {
    title: "Stock bajo",
    icon: AlertCircle,
    color: "invicorp-warn",
  },
  out_of_stock: {
    title: "Agotados",
    icon: PackageMinus,
    color: "invicorp-danger",
  },
  inventory_value: {
    title: "Valor inventario",
    icon: DollarSign,
    color: "invicorp-success",
  },
  recent_movements: {
    title: "Movimientos hoy",
    icon: Activity,
    color: "invicorp-accent2",
  },
};
