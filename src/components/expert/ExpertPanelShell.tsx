"use client";

import type { ExpertNavCounts, ExpertUserSummary } from "@/lib/expert/types";
import { clearExpertSession } from "@/lib/expert/authService";
import {
  loadExtendedProfile,
  saveExtendedProfile,
} from "@/lib/expert/expertProfileExtended";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useState } from "react";

const NAV = [
  {
    href: "/expert/queue",
    label: "Queue",
    key: "queue" as const,
    icon: "queue" as const,
  },
  {
    href: "/expert/drafts",
    label: "Drafts",
    key: "drafts" as const,
    icon: "drafts" as const,
  },
  {
    href: "/expert/history",
    label: "History",
    key: null,
    icon: "history" as const,
  },
  {
    href: "/expert/profile",
    label: "My Profile",
    key: null,
    icon: "profile" as const,
  },
] as const;

type ExpertPanelShellProps = {
  expertId: string;
  user: ExpertUserSummary;
  navCounts: ExpertNavCounts;
  status?: string;
  children: ReactNode;
};

function SidebarLogo() {
  return (
    <div className="flex items-center gap-3 px-1">
      <span
        className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1c1917] shadow-sm"
        aria-hidden
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="14" cy="14" r="9" fill="#d4a853" />
          <circle cx="14" cy="14" r="7" stroke="#8b6914" strokeWidth="1" />
          <path
            d="M8 14h12"
            stroke="#8b6914"
            strokeWidth="0.75"
            strokeDasharray="1.5 1.5"
          />
          <path
            d="M5 9l18 10"
            stroke="#4ade80"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-orange-500 px-1 text-[7px] font-bold leading-none text-white">
          AI
        </span>
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-lg font-semibold tracking-tight">Coinzy</p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-expert-sidebar-muted">
          Expert panel
        </p>
      </div>
    </div>
  );
}

function NavIcon({ kind }: { kind: (typeof NAV)[number]["icon"] }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "queue":
      return (
        <svg {...props}>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
    case "drafts":
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "profile":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
  }
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function AvailabilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Availability"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/8"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-white/20"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="text-sm font-medium text-expert-sidebar-foreground">
        Available
      </span>
    </button>
  );
}

type ExpertNavInnerProps = {
  expertId: string;
  user: ExpertUserSummary;
  navCounts: ExpertNavCounts;
  status?: string;
  onNavigate?: () => void;
};

function statusLabel(status?: string): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function ExpertNavInner({
  expertId,
  user,
  navCounts,
  status,
  onNavigate,
}: ExpertNavInnerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const extended = loadExtendedProfile(expertId);
    setIsAvailable(extended.isAvailable);
  }, [expertId]);

  const handleAvailabilityChange = (next: boolean) => {
    setIsAvailable(next);
    const extended = loadExtendedProfile(expertId);
    saveExtendedProfile(expertId, { ...extended, isAvailable: next });
  };

  async function handleLogout() {
    await clearExpertSession();
    router.push("/expert/login");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-8 lg:mb-10">
        <SidebarLogo />
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Expert panel">
        {NAV.map((item) => {
          const active =
            item.href === "/expert/queue"
              ? pathname === "/expert/queue" ||
                pathname.startsWith("/expert/queue/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count =
            item.key === "queue"
              ? navCounts.queue
              : item.key === "drafts"
                ? navCounts.drafts
                : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/12 text-expert-sidebar-foreground"
                  : "text-expert-sidebar-muted hover:bg-white/6 hover:text-expert-sidebar-foreground"
              }`}
            >
              <span className="shrink-0 opacity-90">
                <NavIcon kind={item.icon} />
              </span>
              <span className="flex-1">{item.label}</span>
              {count != null && count > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3 px-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-expert-sidebar-muted">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  status === "active" ? "bg-emerald-400" : "bg-amber-400"
                }`}
                aria-hidden
              />
              {statusLabel(status)}
            </p>
          </div>
        </div>

        <AvailabilityToggle
          checked={isAvailable}
          onChange={handleAvailabilityChange}
        />

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-white/15 bg-black/15 px-3 py-2.5 text-sm font-medium text-expert-sidebar-foreground transition-colors hover:border-white/25 hover:bg-black/25"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export function ExpertPanelShell({
  expertId,
  user,
  navCounts,
  status,
  children,
}: ExpertPanelShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <div className="min-h-screen bg-expert-dashboard-canvas">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-expert-sidebar px-4 text-expert-sidebar-foreground shadow-sm lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">
            Coinzy
          </p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-expert-sidebar-muted">
            Expert panel
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-expert-sidebar-foreground transition-colors hover:bg-white/10"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label="Open navigation menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-start">
        <aside className="hidden w-[17.5rem] shrink-0 flex-col border-white/10 bg-expert-sidebar text-expert-sidebar-foreground lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:border-r">
          <div className="flex flex-1 flex-col px-4 pb-6 pt-8">
            <ExpertNavInner
              expertId={expertId}
              user={user}
              navCounts={navCounts}
              status={status}
            />
          </div>
        </aside>

        {menuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] lg:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <aside
              id={menuId}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col border-r border-white/10 bg-expert-sidebar text-expert-sidebar-foreground shadow-2xl lg:hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
                <span className="text-sm font-semibold tracking-tight">
                  Menu
                </span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-sm text-expert-sidebar-muted transition-colors hover:bg-white/10 hover:text-expert-sidebar-foreground"
                  aria-label="Close menu"
                  onClick={closeMenu}
                >
                  ✕
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4">
                <ExpertNavInner
                  expertId={expertId}
                  user={user}
                  navCounts={navCounts}
                  status={status}
                  onNavigate={closeMenu}
                />
              </div>
            </aside>
          </>
        ) : null}

        <div className="min-h-0 min-w-0 flex-1 flex-col lg:flex lg:min-h-screen lg:flex-1">
          <div className="flex-1 px-4 pb-10 pt-5 sm:px-6 lg:px-10 lg:pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
