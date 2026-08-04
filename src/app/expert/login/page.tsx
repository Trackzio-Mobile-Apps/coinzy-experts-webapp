import {
  AuthCard,
  AuthLayout,
  Logo,
} from "@/components/auth";
import { ExpertLoginForm } from "@/components/expert/ExpertLoginForm";
import { ExpertLoginGate } from "@/components/expert/ExpertLoginGate";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sign in | Coinzy Expert Portal",
  description: "Sign in to your Coinzy expert account.",
};

export default function ExpertLoginPage() {
  return (
    <ExpertLoginGate>
      <AuthLayout className={plusJakarta.className}>
        <AuthCard>
          <Logo className="mb-8" />

          <div className="mb-8 space-y-1">
            <h1 className="text-[2rem] font-bold leading-[1.2] tracking-tight text-[#1E1E1F]">
              Welcome back
            </h1>
            <p className="text-base font-normal leading-[1.5] text-[#555557]">
              Sign in to your expert account
            </p>
          </div>

          <ExpertLoginForm />
        </AuthCard>
      </AuthLayout>
    </ExpertLoginGate>
  );
}
