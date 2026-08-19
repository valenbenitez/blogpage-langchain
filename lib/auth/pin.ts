const ADMIN_COOKIE = "admin_session";
const HASH_PREFIX = "blogpage-rag-admin:";

export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN?.trim();

  if (!pin) {
    throw new Error("ADMIN_PIN is not set");
  }

  return pin;
}

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${HASH_PREFIX}${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return mismatch === 0;
}

export async function isAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const expected = await hashPin(getAdminPin());
    return timingSafeEqual(token, expected);
  } catch {
    return false;
  }
}

export { ADMIN_COOKIE };
