import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
export const COOKIE_NAME = "aves_session";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function makeToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  if (sign(issuedAt) !== sig) return false;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return age < THIRTY_DAYS;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
