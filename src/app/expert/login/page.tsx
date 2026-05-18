import { AuthCard, AuthLayout, InputGroup, Logo, PrimaryButton } from "@/components/auth";
import { DEMO_EXPERT_LOGIN } from "@/data/expert-panel.mock";
import { hasExpertAccessSession } from "@/lib/expert-session";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Expert panel login",
  description: "Sign in to the Coinzy expert evaluation panel.",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ExpertLoginPage({ searchParams }: PageProps) {
  if (await hasExpertAccessSession()) {
    redirect("/expert/queue");
  }

  const sp = await searchParams;
  const showError = sp.error === "1";

  return (
    <AuthLayout canvas="expert">
      <AuthCard>
        <Logo className="mb-8 self-start" />

        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Expert panel login
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            Sign in to manage your evaluation queue and drafts.
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-lg border border-border bg-input-bg/80 px-3 py-2.5 text-xs text-text-muted">
          <p className="font-medium text-text">Demo credentials</p>
          <p className="font-mono">
            {DEMO_EXPERT_LOGIN.email} / {DEMO_EXPERT_LOGIN.password}
          </p>
          <p>
            Login uses a normal form POST to{" "}
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11px]">
              /api/expert/login
            </code>{" "}
            and sets an HttpOnly cookie with a dummy access token (JWT-like
            shape:{" "}
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11px]">
              cz.&lt;payload&gt;.mock_hs256_placeholder
            </code>
            ). Replace that route with your API when ready.
          </p>
          {process.env.NODE_ENV === "development" ? (
            <p>
              <a
                href="/api/expert/dev-session"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Skip login (dev only)
              </a>{" "}
              — sets the same demo cookie and opens the queue.
            </p>
          ) : null}
        </div>

        {showError ? (
          <p
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            Invalid email or password. Use the demo credentials above.
          </p>
        ) : null}

        <form className="space-y-5" method="post" action="/api/expert/login">
          <InputGroup
            label="Email"
            id="expert-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={DEMO_EXPERT_LOGIN.email}
            required
          />
          <InputGroup
            label="Password"
            id="expert-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            defaultValue={DEMO_EXPERT_LOGIN.password}
            required
          />

          <PrimaryButton type="submit">Log in</PrimaryButton>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Expert portal sign-in (account)
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
