import { NextRequest, NextResponse } from "next/server";

import { ADMIN_COOKIE, isAdminToken } from "@/lib/auth/pin";

function isProtectedPath(pathname: string): boolean {
  return pathname === "/create" || pathname.endsWith("/edit");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await isAdminToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/create", "/:slug/edit"],
};
