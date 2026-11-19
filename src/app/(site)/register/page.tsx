import type { Metadata } from "next";
import { AuthPage } from "@/components/account/auth-page";

export const metadata: Metadata = { title: "Register", robots: { index: false } };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return <AuthPage mode="register" searchParams={searchParams} />;
}
