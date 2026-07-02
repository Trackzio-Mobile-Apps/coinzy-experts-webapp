import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in | Coinzy Expert Portal",
  description: "Sign in to your Coinzy expert account.",
};

export default function SignInPage() {
  redirect("/expert/login");
}
