import { cookies } from "next/headers";

export const CHAT_SEND_COOKIE = "chat_sends";

export type ChatQuota = {
  limit: number | null;
  used: number;
  remaining: number | null;
};

export function getChatMessageLimit(): number | null {
  const raw = process.env.CHAT_MESSAGE_LIMIT?.trim();

  if (raw === undefined || raw === "") {
    return 2;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 2;
  }

  if (parsed === 0) {
    return null;
  }

  return parsed;
}

export async function readChatSends(): Promise<number> {
  const jar = await cookies();
  const raw = jar.get(CHAT_SEND_COOKIE)?.value;
  const used = Number.parseInt(raw ?? "0", 10);

  if (!Number.isFinite(used) || used < 0) {
    return 0;
  }

  return used;
}

export async function getChatQuota(): Promise<ChatQuota> {
  const limit = getChatMessageLimit();
  const used = await readChatSends();

  if (limit === null) {
    return { limit: null, used, remaining: null };
  }

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

export async function consumeChatSend(): Promise<ChatQuota | null> {
  const quota = await getChatQuota();

  if (quota.limit === null) {
    return quota;
  }

  if (quota.remaining === 0) {
    return null;
  }

  const used = quota.used + 1;
  const jar = await cookies();
  jar.set(CHAT_SEND_COOKIE, String(used), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return {
    limit: quota.limit,
    used,
    remaining: Math.max(0, quota.limit - used),
  };
}
