import {
  AuthCard,
  AuthLayout,
  Logo,
} from "@/components/auth";
import { ExpertLoginForm } from "@/components/expert/ExpertLoginForm";
import { ExpertLoginGate } from "@/components/expert/ExpertLoginGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Coinzy Expert Portal",
  description: "Sign in to your Coinzy expert account.",
};

export default function ExpertLoginPage() {
  return (
    <ExpertLoginGate>
      <AuthLayout>
        <AuthCard>
          <Logo className="mb-8" />

          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Welcome back
            </h1>
            <p className="text-sm text-text-muted">
              Sign in to your expert account
            </p>
          </div>

          <ExpertLoginForm />


        </AuthCard>
      </AuthLayout>
    </ExpertLoginGate>
  );
}
