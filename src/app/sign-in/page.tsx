import type { Metadata } from "next";
import {
  AuthCard,
  AuthLayout,
  InputGroup,
  Logo,
  PrimaryButton,
  TextLink,
} from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign in | Coinzy Expert Portal",
  description: "Sign in to your Coinzy expert account.",
};

export default function SignInPage() {
  return (
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

        <form className="space-y-5" action="#" method="post">
          <InputGroup
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <InputGroup
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />

          <div className="flex justify-end">
            <TextLink href="/forgot-password">Forgot password?</TextLink>
          </div>

          <PrimaryButton type="submit">Sign in</PrimaryButton>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <TextLink href="/sign-up" variant="strong">
            Create account
          </TextLink>
        </p>
        <p className="mt-4 text-center text-sm text-text-muted">
          <TextLink href="/expert/login">Expert evaluation panel</TextLink>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
