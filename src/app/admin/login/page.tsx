import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/server/auth/dal";
import logo from "../../../../public/brand/topx-logo.png";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

/** Already signed in as admin/staff → skip the login page. */
async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user && (user.role === "admin" || user.role === "staff")) redirect("/admin");
  return null;
}

/** Reads ?next= and ?error= (request data, so it sits inside Suspense). */
async function LoginFormWithParams({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return <LoginForm next={next} forbidden={sp.error === "forbidden"} />;
}

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="bg-hero-light flex min-h-dvh items-center justify-center px-4 py-12 dark:bg-hero">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 block w-fit" aria-label="TOPX Nepal home">
          <Image src={logo} alt="TOPX Nepal" loading="eager" sizes="200px" className="h-14 w-auto" />
        </Link>
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-card-hover sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-black italic">Admin sign in</h1>
              <p className="text-sm text-muted-foreground">Staff and administrators only.</p>
            </div>
          </div>
          <Suspense fallback={<LoginForm />}>
            <LoginFormWithParams searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to the store
          </Link>
        </p>
      </div>
    </main>
  );
}
