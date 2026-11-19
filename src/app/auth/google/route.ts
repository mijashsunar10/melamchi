import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// "Continue with Google" → send the visitor to Google's sign-in page.
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const url = new URL(req.url);
  if (!clientId) return NextResponse.redirect(new URL("/login?error=google-off", url));
  const next = url.searchParams.get("next") ?? "/account";
  const state = randomBytes(16).toString("hex");
  (await cookies()).set("g_state", JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${url.origin}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();
  return NextResponse.redirect(google);
}
