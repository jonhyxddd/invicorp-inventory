/**
 * Utilidades criptográficas para el PIN.
 * - El PIN nunca se almacena en texto plano.
 * - Se genera un salt único por usuario.
 * - El hash se deriva con PBKDF2 (SHA-256) como alternativa compatible
 *   con el entorno del navegador / Supabase Edge Function.
 *   En producción se recomienda Argon2id vía Edge Function de Supabase.
 */

const ENCODER = new TextEncoder();

export async function generateSalt(length = 32): Promise<string> {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: ENCODER.encode(salt),
      iterations: 200000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );

  const raw = await crypto.subtle.exportKey("raw", derivedKey);
  const hashArray = Array.from(new Uint8Array(raw));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPin(pin: string, hash: string, salt: string): Promise<boolean> {
  const computedHash = await hashPin(pin, salt);
  // Comparación en tiempo constante para evitar timing attacks
  if (computedHash.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < computedHash.length; i++) {
    result |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}
