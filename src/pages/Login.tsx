import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { hashPin, generateSalt, verifyPin } from "@/lib/crypto";
import { supabase } from "@/lib/supabaseClient";
import userService from "@/services/userService";
import { checkPinConfigured } from "@/stores/authStore";

export function Login() {
  const navigate = useNavigate();
  const { user, setPinConfigured, setSession } = useAuthStore();
  const [pin, setPin] = useState("");
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showPin, setShowPin] = useState(false);

  const PIN_LENGTH = 6;

  useEffect(() => {
    if (user?.id) {
      checkPinConfigured(user.id).then((configured) => {
        setPinConfigured(configured);
        setIsSetupMode(!configured);
      });
    }
  }, [user?.id]);

  const addDigit = useCallback((digit: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + digit);
      setError("");
    }
  }, [pin]);

  const removeDigit = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  const clearPin = useCallback(() => {
    setPin("");
    setError("");
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < PIN_LENGTH) {
      setError(`Ingresa los ${PIN_LENGTH} dígitos`);
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      if (!user?.id) throw new Error("Usuario no encontrado");

      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("pin_hash, pin_salt, pin_attempts, pin_locked_until")
        .eq("id", user.id)
        .single();

      if (fetchError || !profile) {
        setError("Error verificando PIN");
        setIsVerifying(false);
        return;
      }

      if (
        profile.pin_locked_until &&
        new Date(profile.pin_locked_until) > new Date()
      ) {
        const remaining = Math.ceil(
          (new Date(profile.pin_locked_until).getTime() - Date.now()) /
            1000 /
            60
        );
        setError(`Cuenta bloqueada. Intenta en ${remaining} min`);
        setIsVerifying(false);
        return;
      }

      if (!profile.pin_hash || !profile.pin_salt) {
        setError("PIN no configurado. Crea uno nuevo.");
        setIsVerifying(false);
        setIsSetupMode(true);
        return;
      }

      const isValid = await verifyPin(
        pin,
        profile.pin_hash!,
        profile.pin_salt!
      );

      if (!isValid) {
        await userService.recordFailedAttempt(user.id);
        setError("PIN incorrecto");
        setIsVerifying(false);
        return;
      }

      await userService.resetAttempts(user.id);
      setSession(user as any, null);
      navigate("/dashboard");
    } catch (err) {
      setError("Error verificando PIN");
      setIsVerifying(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < PIN_LENGTH) {
      setError(`Ingresa los ${PIN_LENGTH} dígitos`);
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      if (!user?.id) throw new Error("Usuario no encontrado");

      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      await userService.updatePin(user.id, hash, salt);
      setPinConfigured(true);
      setSession(user as any, null);
      navigate("/dashboard");
    } catch (err) {
      setError("Error configurando PIN");
      setIsVerifying(false);
    }
  };

  const digits = pin.padStart(PIN_LENGTH, " ").split("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-invicorp-dark px-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-panel w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-invicorp-accent/20 rounded-2xl flex items-center justify-center text-invicorp-accent shadow-glow">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-invicorp-text tracking-tight">
            INVICORP<span className="text-invicorp-accent">INVENTORY</span>
          </span>
        </div>

        <h1 className="text-center text-2xl font-bold text-invicorp-text mb-2">
          {isSetupMode ? "Configurar acceso" : "Inventario protegido"}
        </h1>
        <p className="text-center text-invicorp-muted text-sm mb-8">
          {isSetupMode
            ? "Crea tu PIN de desbloqueo"
            : "Introduce tu PIN para continuar"}
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {digits.map((d, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
                pin.length > i
                  ? "border-invicorp-accent bg-invicorp-accent/20"
                  : "border-invicorp-line/50"
              } transition-all duration-200`}
            >
              {pin.length > i ? (
                <span className="text-invicorp-accent font-mono font-bold text-lg">
                  {showPin ? d : "\u2022"}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-invicorp-danger/10 border border-invicorp-danger/20 flex items-center gap-2 text-sm text-invicorp-danger">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {!isSetupMode && (
          <button
            onClick={() => setShowPin(!showPin)}
            className="w-full flex items-center justify-center gap-2 text-xs text-invicorp-muted hover:text-invicorp-accent mb-6 py-2"
          >
            {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPin ? "Ocultar PIN" : "Mostrar PIN"}
          </button>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => addDigit(String(num))}
              className="h-14 rounded-2xl bg-invicorp-panel2 border border-invicorp-line text-invicorp-text font-semibold hover:bg-invicorp-line/50 hover:shadow-glow transition-all active:scale-95 disabled:opacity-30"
              disabled={isVerifying}
            >
              {num}
            </button>
          ))}
          <button className="h-14 rounded-2xl bg-invicorp-panel2 border border-invicorp-line opacity-30" disabled />
          <button
            onClick={removeDigit}
            className="h-14 rounded-2xl bg-invicorp-panel2 border border-invicorp-line text-invicorp-muted flex items-center justify-center hover:bg-invicorp-line/50 transition-all active:scale-95 disabled:opacity-30"
            disabled={isVerifying || pin.length === 0}
          >
            <span className="text-lg">\u232B</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => addDigit("0")}
            className="col-span-2 h-14 rounded-2xl bg-invicorp-panel2 border border-invicorp-line text-invicorp-text font-semibold hover:bg-invicorp-line/50 hover:shadow-glow transition-all active:scale-95 disabled:opacity-30"
            disabled={isVerifying}
          >
            0
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={clearPin}
            className="h-12 rounded-xl bg-invicorp-panel2 border border-invicorp-line text-invicorp-muted text-sm font-medium hover:bg-invicorp-line/50 transition-all disabled:opacity-30"
            disabled={isVerifying || pin.length === 0}
          >
            Borrar
          </button>
          <button
            onClick={isSetupMode ? handleSetup : handleUnlock}
            className={`h-12 rounded-xl text-white font-bold hover:shadow-glow transition-all disabled:opacity-50 ${isSetupMode ? "bg-invicorp-accent hover:bg-invicorp-accent/90" : "bg-gradient-to-r from-invicorp-accent to-invicorp-accent2"}`}
            disabled={isVerifying || pin.length < PIN_LENGTH}
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSetupMode ? (
              "Configurar PIN"
            ) : (
              "Desbloquear"
            )}
          </button>
        </div>

        {!isSetupMode && (
          <p className="text-center text-xs text-invicorp-muted/60 mt-4">
            ¿Olvidaste tu PIN? Contacta al administrador del sistema.
          </p>
        )}
      </div>
    </div>
  );
}
