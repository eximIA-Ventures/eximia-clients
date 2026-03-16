import crypto from "crypto";

export function generateKey(appSlug: string): {
  full: string;
  prefix: string;
  hash: string;
} {
  const random = crypto.randomBytes(32).toString("hex");
  const full = `eximia_${appSlug}_${random}`;
  const prefix = full.slice(0, 16);
  const hash = crypto.createHash("sha256").update(full).digest("hex");
  return { full, prefix, hash };
}

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
