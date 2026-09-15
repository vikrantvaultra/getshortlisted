"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COLLEGE_TIERS, type CollegeTier } from "@/config";
import { rateLimitAction } from "@/lib/server/actions";
import { ADMIN_COOKIE, adminCookieValue, checkAdminPassword, requireAdmin } from "@/lib/server/admin-auth";
import { approveSubmission, deleteSubmission, rejectSubmission } from "@/lib/server/submissions";

export async function login(formData: FormData) {
  if (await rateLimitAction("adminLogin")) redirect("/admin/login?error=rate");
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) redirect("/admin/login?error=1");
  (await cookies()).set(ADMIN_COOKIE, adminCookieValue(password), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function approve(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const tier = String(formData.get("collegeTier")) as CollegeTier;
  try {
    approveSubmission(id, {
      redactedText: String(formData.get("redactedText") ?? ""),
      collegeTier: COLLEGE_TIERS.includes(tier) ? tier : "Not disclosed",
    });
  } catch (error) {
    redirect(`/admin/submissions/${id}?error=${encodeURIComponent(error instanceof Error ? error.message : "Approval failed")}`);
  }
  redirect(`/admin/submissions/${id}?done=approved`);
}

export async function reject(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  try {
    rejectSubmission(id, String(formData.get("reason") ?? ""));
  } catch (error) {
    redirect(`/admin/submissions/${id}?error=${encodeURIComponent(error instanceof Error ? error.message : "Rejection failed")}`);
  }
  redirect(`/admin/submissions/${id}?done=rejected`);
}

export async function remove(formData: FormData) {
  await requireAdmin();
  deleteSubmission(String(formData.get("id")));
  redirect("/admin?deleted=1");
}
