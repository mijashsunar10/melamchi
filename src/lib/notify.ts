// Email copy of every order / support message / reseller application.
// NOW: sent from the browser through FormSubmit (works on the static cPanel site — no server needed).
//      The first message ever sent asks the inbox to click "Activate" once; after that every message arrives.
// BACKEND: send from the server instead (POST /api/orders etc. emails the shop) and delete this file.

/** Inbox that receives the copies. Set NEXT_PUBLIC_ORDER_EMAIL in .env (empty = no emails). */
const ORDER_EMAIL = process.env.NEXT_PUBLIC_ORDER_EMAIL || "";

/**
 * Fire-and-forget: never blocks or breaks the WhatsApp hand-off.
 * `keepalive` lets the request finish even after the page opens WhatsApp.
 */
export function emailCopy(subject: string, text: string, replyTo?: string) {
  if (!ORDER_EMAIL || typeof window === "undefined") return;
  const body = new URLSearchParams({
    _subject: subject,
    _template: "box",
    _captcha: "false",
    message: text,
    page: window.location.href,
    ...(replyTo ? { _replyto: replyTo } : {}),
  });
  // form-encoded = "simple" request: no CORS preflight, so keepalive works in every browser
  fetch(`https://formsubmit.co/ajax/${ORDER_EMAIL}`, { method: "POST", body, keepalive: true, mode: "no-cors" }).catch(() => {});
}
