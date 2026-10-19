import { describe, it, expect } from "vitest";
import { hashPin, generateSalt, verifyPin } from "@/lib/crypto";

describe("Criptografía de PIN", () => {
  it("debe generar un salt único", async () => {
    const salt1 = await generateSalt();
    const salt2 = await generateSalt();
    expect(salt1).toBeDefined();
    expect(salt2).toBeDefined();
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBe(64); // 32 bytes en hex
  });

  it("debe hacer hash del PIN y verificarlo correctamente", async () => {
    const pin = "123456";
    const salt = await generateSalt();
    const hash = await hashPin(pin, salt);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");

    const isValid = await verifyPin(pin, hash, salt);
    expect(isValid).toBe(true);
  });

  it("debe rechazar un PIN incorrecto", async () => {
    const salt = await generateSalt();
    const hash = await hashPin("123456", salt);

    const isValid = await verifyPin("654321", hash, salt);
    expect(isValid).toBe(false);
  });

  it("no debe almacenar el PIN en texto plano", async () => {
    const pin = "mi_pin_secreto";
    const salt = await generateSalt();
    const hash = await hashPin(pin, salt);

    expect(hash).not.toBe(pin);
    expect(hash.length).toBeGreaterThan(pin.length);
  });
});
