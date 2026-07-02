"use client";

import { InputGroup, PasswordInputGroup, PrimaryButton, TextLink } from "@/components/auth";
import {
  clearExpertAccountDisabled,
  isExpertAccountDisabled,
} from "@/lib/expert/apiClient";
import {
  clearExpertSession,
  ExpertLoginError,
  login,
} from "@/lib/expert/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const alertClass =
  "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800";

export function ExpertLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void clearExpertSession();

    if (isExpertAccountDisabled()) {
      setAccountDisabled(true);
      clearExpertAccountDisabled();
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAccountDisabled(false);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await login(email, password);
      router.replace("/expert/queue");
    } catch (err) {
      if (err instanceof ExpertLoginError) {
        if (err.status === 403) {
          setAccountDisabled(true);
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {accountDisabled ? (
        <p className={alertClass} role="alert">
          Your expert account is not active. Contact support if you need access.
        </p>
      ) : null}

      {error ? (
        <p className={alertClass} role="alert">
          {error}
        </p>
      ) : null}

      <InputGroup
        label="Email"
        id="expert-email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="test.expert@coinzy.local"
        required
      />
      <PasswordInputGroup
        label="Password"
        id="expert-password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />

      {/* <div className="flex justify-end">
        <TextLink href="/forgot-password">Forgot password?</TextLink>
      </div> */}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </PrimaryButton>

      {/* <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <TextLink href="/sign-up" variant="strong">
          Create account
        </TextLink>
      </p> */}
    </form>
  );
}
