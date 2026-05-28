const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
export const COOKIE_NAME = "aves_session";

const encoder = new TextEncoder();

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function makeToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmac(issuedAt);
  return `${issuedAt}.${sig}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = await hmac(issuedAt);
  if (!timingSafeEqualHex(sig, expected)) return false;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return age < THIRTY_DAYS;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
