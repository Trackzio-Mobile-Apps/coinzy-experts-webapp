type LogoProps = {
  className?: string;
  /** Subtitle under the Coinzy wordmark. */
  portal?: "expert" | "client";
};

function Mark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="24" height="24" rx="5" fill="var(--coinzy-logo-bg)" />
      <path
        d="M7 17V7h2.6c2.2 0 3.6 1.3 3.6 3.2 0 1.9-1.4 3.2-3.6 3.2H9.8V17H7Zm2.6-5.6c.9 0 1.4-.5 1.4-1.3 0-.8-.5-1.3-1.4-1.3H9.8v2.6h.05Z"
        fill="var(--coinzy-logo-accent)"
      />
    </svg>
  );
}

const portalLabels: Record<NonNullable<LogoProps["portal"]>, string> = {
  expert: "Expert Portal",
  client: "Client Portal",
};

/**
 * Brand lockup: mark + Coinzy + portal line.
 */
export function Logo({ className = "", portal = "expert" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex shrink-0" aria-hidden>
        <Mark />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-semibold tracking-tight text-text">
          Coinzy
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
          {portalLabels[portal]}
        </span>
      </div>
    </div>
  );
}
