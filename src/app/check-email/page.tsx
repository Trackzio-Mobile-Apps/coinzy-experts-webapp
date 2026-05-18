import type { Metadata } from "next";
import {
  AuthCard,
  AuthLayout,
  BackToSignInLink,
  Logo,
  ResendTextButton,
  SuccessCheckIllustration,
} from "@/components/auth";

export const metadata: Metadata = {
  title: "Check your email | Coinzy Expert Portal",
  description: "We sent password reset instructions to your email.",
};

export default function CheckEmailPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <Logo className="mb-10 self-start" />

        <div className="mb-10 flex flex-col items-center text-center">
          <SuccessCheckIllustration className="mb-8" />
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Check your email
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
            We&apos;ve sent password reset instructions to your email address.
          </p>
        </div>

        <p className="text-center text-sm text-text-muted">
          Didn&apos;t receive the email?{" "}
          <ResendTextButton>Click to resend</ResendTextButton>
        </p>

        <BackToSignInLink className="mt-12" />
      </AuthCard>
    </AuthLayout>
  );
}
