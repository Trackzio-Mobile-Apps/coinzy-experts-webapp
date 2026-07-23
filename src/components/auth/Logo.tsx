type LogoProps = {
  className?: string;
  /** Subtitle under the Coinzy wordmark. */
  portal?: "expert" | "client";
};

function Mark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset from /public
    <img
      src="/coinzy-logo.png"
      alt="Coinzy"
      width={40}
      height={40}
      className="h-10 w-10 rounded-lg bg-black object-cover shadow-sm ring-1 ring-black/10"
    />
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
