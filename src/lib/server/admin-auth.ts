import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hmac, safeEqual } from "./crypto";

/**
 * Single shared admin password from ADMIN_PASSWORD. The cookie holds an HMAC
 * of the password, so changing the password logs everyone out. No sessions.
 */

export const ADMIN_COOKIE = "gs_admin";
const DEVELOPMENT_PASSWORD = "admin";

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  // Never fall back in production: an unset password disables the admin panel.
  return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_PASSWORD;
}

export function adminCookieValue(password: string): string {
  return hmac(`admin:${password}`);
}

export function checkAdminPassword(candidate: string): boolean {
  const password = adminPassword();
  return password !== null && safeEqual(adminCookieValue(candidate), adminCookieValue(password));
}

export async function isAdmin(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!value && safeEqual(value, adminCookieValue(password));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
