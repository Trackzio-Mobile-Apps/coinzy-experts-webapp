import type { SVGProps } from "react";

const navIconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export type ExpertNavIconKind = "queue" | "drafts" | "history" | "profile";

/** Queue — rounded document with three list lines. */
export function ExpertQueueNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...navIconProps} {...props}>
      <rect x="5" y="4" width="14" height="16" rx="2.75" />
      <path d="M8.5 9h3.25" />
      <path d="M8.5 12h7.75" />
      <path d="M8.5 15h5" />
    </svg>
  );
}

/** Drafts — document with open top-right corner and pencil. */
export function ExpertDraftsNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...navIconProps} {...props}>
      <path d="M6.25 7.5a1.75 1.75 0 0 1 1.75-1.75H12.75" />
      <path d="M6.25 7.5v10a1.75 1.75 0 0 0 1.75 1.75h8a1.75 1.75 0 0 0 1.75-1.75v-7.75" />
      <path d="M8.25 10.25h3.25" />
      <path d="M8.25 13.75h6.75" />
      <path
        d="M18.6 4.9 14.15 9.35"
        strokeWidth="2.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExpertHistoryNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...navIconProps} strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ExpertProfileNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...navIconProps} strokeWidth={2} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ExpertNavIcon({
  kind,
  ...props
}: { kind: ExpertNavIconKind } & SVGProps<SVGSVGElement>) {
  switch (kind) {
    case "queue":
      return <ExpertQueueNavIcon {...props} />;
    case "drafts":
      return <ExpertDraftsNavIcon {...props} />;
    case "history":
      return <ExpertHistoryNavIcon {...props} />;
    case "profile":
      return <ExpertProfileNavIcon {...props} />;
  }
}
