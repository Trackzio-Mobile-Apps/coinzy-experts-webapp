"use client";

import { ExpertLogoutConfirmModal } from "@/components/expert/ExpertLogoutConfirmModal";
import type { ExpertNavCounts, ExpertUserSummary } from "@/lib/expert/types";
import { clearExpertSession } from "@/lib/expert/authService";
import {
  ExpertProfileError,
  updateMyAvailability,
} from "@/lib/expert/profileService";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
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
  user: ExpertUserSummary;
  navCounts: ExpertNavCounts;
  status?: string;
  children: ReactNode;
};

function SidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 xl:gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset from /public */}
      <img
        src="/coinzy-logo.png"
        alt="Coinzy"
        width={48}
        height={48}
        className="h-10 w-10 shrink-0 rounded-[10px] bg-black object-cover shadow-sm ring-1 ring-white/25 xl:h-12 xl:w-12 xl:rounded-xl"
      />
      <div className="min-w-0 leading-tight">
        <p className="text-sm font-semibold tracking-tight xl:text-base">Coinzy</p>
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-expert-sidebar-muted xl:text-[10px]">
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
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Availability"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/15 px-3 py-1.5 text-left transition-colors hover:bg-white/20 disabled:cursor-wait disabled:opacity-70 xl:py-2.5"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-expert-available" : "bg-white/20"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[1.125rem]" : "translate-x-0.5"
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
  user: ExpertUserSummary;
  navCounts: ExpertNavCounts;
  status?: string;
  onNavigate?: () => void;
  onRequestLogout: () => void;
};

function statusLabel(status?: string): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function ExpertNavInner({
  user,
  navCounts,
  status,
  onNavigate,
  onRequestLogout,
}: ExpertNavInnerProps) {
  const pathname = usePathname();
  const { profile, hydrateProfile } = useExpertProfile();
  const [isAvailable, setIsAvailable] = useState(
    profile?.isAvailableForRequests ?? true,
  );
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  useEffect(() => {
    if (profile?.isAvailableForRequests != null) {
      setIsAvailable(profile.isAvailableForRequests);
    }
  }, [profile?.isAvailableForRequests]);

  const handleAvailabilityChange = async (next: boolean) => {
    if (isSavingAvailability) return;

    const previous = isAvailable;
    setIsAvailable(next);
    setIsSavingAvailability(true);

    try {
      const updated = await updateMyAvailability(next);
      hydrateProfile(updated);
      setIsAvailable(updated.isAvailableForRequests);
    } catch (err) {
      setIsAvailable(previous);
      if (err instanceof ExpertProfileError && err.code === "unauthorized") {
        return;
      }
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to update availability. Please try again.",
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-6 xl:mb-8">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors xl:py-3 ${
                active
                  ? "bg-white/20 text-expert-sidebar-foreground shadow-sm"
                  : "text-expert-sidebar-muted hover:bg-white/6 hover:text-expert-sidebar-foreground"
              }`}
            >
              <span className="shrink-0 opacity-90">
                <NavIcon kind={item.icon} />
              </span>
              <span className="flex-1">{item.label}</span>
              {count != null && count > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-expert-nav-badge px-1.5 text-[11px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="-mx-4 mt-auto space-y-2 border-t border-white/15 px-4 pt-3 lg:-mx-5 lg:px-5 xl:-mx-8 xl:space-y-3 xl:px-8 xl:pt-5">
        <div className="flex items-center gap-3 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold xl:h-12 xl:w-12 xl:text-sm">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-expert-sidebar-muted">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  status === "active"
                    ? "bg-expert-status-active"
                    : "bg-expert-status-inactive"
                }`}
                aria-hidden
              />
              {statusLabel(status)}
            </p>
          </div>
        </div>

        <AvailabilityToggle
          checked={isAvailable}
          disabled={isSavingAvailability}
          onChange={(next) => {
            void handleAvailabilityChange(next);
          }}
        />

        <button
          type="button"
          onClick={onRequestLogout}
          className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-sm font-medium text-expert-sidebar-foreground transition-colors hover:border-white/25 hover:bg-black/30 xl:py-2.5"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export function ExpertPanelShell({
  user,
  navCounts,
  status,
  children,
}: ExpertPanelShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const openLogoutConfirm = useCallback(() => {
    closeMenu();
    setLogoutOpen(true);
  }, [closeMenu]);

  const closeLogoutConfirm = useCallback(() => {
    if (isLoggingOut) return;
    setLogoutOpen(false);
  }, [isLoggingOut]);

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await clearExpertSession();
      router.push("/expert/login");
    } finally {
      setIsLoggingOut(false);
      setLogoutOpen(false);
    }
  }, [router]);

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

  const isRequestDetail =
    /^\/expert\/queue\/[^/]+\/?$/.test(pathname);

  if (isRequestDetail) {
    return (
      <main className="flex h-dvh flex-col overflow-hidden bg-expert-dashboard-canvas px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="mx-auto flex min-h-0 w-full max-w-[96rem] flex-1 flex-col">
          {children}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-expert-dashboard-canvas">
      <ExpertLogoutConfirmModal
        open={logoutOpen}
        isLoggingOut={isLoggingOut}
        onCancel={closeLogoutConfirm}
        onConfirm={() => {
          void confirmLogout();
        }}
      />

      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-expert-sidebar px-4 text-expert-sidebar-foreground shadow-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset from /public */}
          <img
            src="/coinzy-logo.png"
            alt="Coinzy"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-[10px] bg-black object-cover ring-1 ring-white/25"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">
              Coinzy
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-expert-sidebar-muted">
              Expert panel
            </p>
          </div>
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

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
        <aside className="hidden w-60 shrink-0 flex-col border-white/10 bg-expert-sidebar text-expert-sidebar-foreground lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:border-r">
          <div className="flex flex-1 flex-col px-5 pb-4 pt-6 xl:px-6 xl:pb-5 xl:pt-8">
            <ExpertNavInner
              user={user}
              navCounts={navCounts}
              status={status}
              onRequestLogout={openLogoutConfirm}
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
              className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,15rem)] flex-col border-r border-white/10 bg-expert-sidebar text-expert-sidebar-foreground shadow-2xl lg:hidden"
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
                  user={user}
                  navCounts={navCounts}
                  status={status}
                  onNavigate={closeMenu}
                  onRequestLogout={openLogoutConfirm}
                />
              </div>
            </aside>
          </>
        ) : null}

        <div className="min-h-0 min-w-0 flex-1 lg:min-h-screen">
          <div className="w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8 xl:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
