"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  getAdminPin,
  hashPin,
  timingSafeEqual,
} from "@/lib/auth/pin";

type AuthResult =
  | { success: true }
  | { success: false; error: string };

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/create";
  }

  return next;
}

export async function verifyPinAction(
  pin: string,
  next?: string,
): Promise<AuthResult> {
  const trimmed = pin.trim();

  if (!trimmed) {
    return { success: false, error: "Ingresá el PIN." };
  }

  let expected: string;
  try {
    expected = await hashPin(getAdminPin());
  } catch {
    return {
      success: false,
      error: "El PIN de admin no está configurado.",
    };
  }

  const received = await hashPin(trimmed);

  if (!timingSafeEqual(expected, received)) {
    return { success: false, error: "PIN incorrecto." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(safeNextPath(next));
}

export async function requireAdmin(): Promise<AuthResult> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;

  try {
    const expected = await hashPin(getAdminPin());
    if (!token || !timingSafeEqual(token, expected)) {
      return { success: false, error: "No autorizado." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "No autorizado." };
  }
}
