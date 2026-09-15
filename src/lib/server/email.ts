import { SITE } from "@/config";
import { siteUrl } from "@/lib/site";

/**
 * Transactional email through Resend's HTTP API (no SDK). If RESEND_API_KEY
 * is not set, nothing is sent and the caller shows the link on screen — the
 * submission page always does that anyway.
 */
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: SITE.emailFrom, to, subject, html, text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.warn(`[email] Resend responded ${response.status}`);
    return response.ok;
  } catch {
    console.warn("[email] Resend request failed");
    return false;
  }
}

export function sendSubmissionConfirmation(to: string, deleteToken: string, company: string) {
  const deleteUrl = `${siteUrl()}/delete/${deleteToken}`;
  const text = `Thank you for sending your resume.

We'll check your offer proof for ${company} and remove your name, phone number, email address, exact dates and photo before anything is used.

Changed your mind? This link deletes your submission, your files and everything we built from them:
${deleteUrl}

Keep this email. The link is the only way to delete without writing to us.

— ${SITE.name}
${SITE.contactEmail}`;

  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#141414;max-width:520px">
<p>Thank you for sending your resume.</p>
<p>We'll check your offer proof for <strong>${escapeHtml(company)}</strong> and remove your name, phone number, email address, exact dates and photo before anything is used.</p>
<p>Changed your mind? This link deletes your submission, your files and everything we built from them:</p>
<p><a href="${deleteUrl}" style="color:#141414">${deleteUrl}</a></p>
<p style="color:#6b6760">Keep this email. The link is the only way to delete without writing to us.</p>
<p>— ${SITE.name}</p></div>`;

  return sendEmail(to, "Your resume submission — and how to delete it", html, text);
}

export function sendAccessEmail(to: string, productName: string, orderId: string) {
  const restoreUrl = `${siteUrl()}/unlock?restore=1`;
  const text = `Payment received for ${productName}.

Your order ID is ${orderId}. To open ${productName} on another device, go to ${restoreUrl} and enter this email and the order ID.

— ${SITE.name}`;
  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#141414;max-width:520px">
<p>Payment received for <strong>${escapeHtml(productName)}</strong>.</p>
<p>Your order ID is <code>${escapeHtml(orderId)}</code>. To open it on another device, go to <a href="${restoreUrl}" style="color:#141414">${restoreUrl}</a> and enter this email and the order ID.</p>
<p>— ${SITE.name}</p></div>`;
  return sendEmail(to, `${productName} — your order ID`, html, text);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
