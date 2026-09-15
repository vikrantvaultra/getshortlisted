"use server";

import { redirect } from "next/navigation";
import { rateLimitAction } from "@/lib/server/actions";
import { deleteSubmission, findByDeleteToken } from "@/lib/server/submissions";

export async function deleteMySubmission(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (await rateLimitAction("form")) redirect(`/delete/${token}`);
  const submission = findByDeleteToken(token);
  if (submission) deleteSubmission(submission.id);
  redirect(`/delete/${token}?deleted=1`);
}
