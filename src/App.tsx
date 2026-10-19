import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { PinLockProvider } from "@/contexts/PinLockContext";
import { useAuthStore } from "@/stores/authStore";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { Products } from "./pages/Products";
import { ProductForm } from "./pages/ProductForm";
import { Movements } from "./pages/Movements";
import { MovementForm } from "./pages/MovementForm";
import { Suppliers } from "./pages/Suppliers";
import { Categories } from "./pages/Categories";
import { Notifications } from "./pages/Notifications";
import { Reports } from "./pages/Reports";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLocked } = useAuthStore();

  if (!isAuthenticated || isLocked) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-invicorp-dark">
      <OfflineIndicator />
      <Header />
      <main className="flex-1 pb-24 sm:pb-0 relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

const App = () => {
  return (
    <PinLockProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/nuevo" element={<ProductForm />} />
            <Route path="/productos/:id" element={<ProductForm />} />
            <Route path="/movimientos" element={<Movements />} />
            <Route path="/movimientos/nueva" element={<MovementForm />} />
            <Route path="/movimientos/entrada" element={<MovementForm />} />
            <Route path="/movimientos/salida" element={<MovementForm />} />
            <Route path="/proveedores" element={<Suppliers />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/notificaciones" element={<Notifications />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/configuracion" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PinLockProvider>
  );
};

export default App;
