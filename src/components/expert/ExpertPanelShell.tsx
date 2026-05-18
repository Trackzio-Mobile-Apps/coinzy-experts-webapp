"use client";

import type { ExpertNavCounts, ExpertUserSummary } from "@/data/expert-panel.mock";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useState } from "react";

const NAV = [
  { href: "/expert/queue", label: "Queue", key: "queue" as const },
  { href: "/expert/drafts", label: "Drafts", key: "drafts" as const },
  { href: "/expert/history", label: "History", key: null },
  { href: "/expert/profile", label: "My profile", key: null },
] as const;

type ExpertPanelShellProps = {
  user: ExpertUserSummary;
  navCounts: ExpertNavCounts;
  children: ReactNode;
};

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

type ExpertNavInnerProps = {
  user: ExpertUserSummary;
  navCounts: ExpertNavCounts;
  /** Close mobile drawer after navigation. */
  onNavigate?: () => void;
};

function ExpertNavInner({ user, navCounts, onNavigate }: ExpertNavInnerProps) {
  const pathname = usePathname();
  const [available, setAvailable] = useState(true);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-8 px-2 pt-2 lg:mb-10 lg:pt-0">
        <p className="text-lg font-semibold tracking-tight">Coinzy</p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-expert-sidebar-muted">
          Expert panel
        </p>
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
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-expert-sidebar-foreground"
                  : "text-expert-sidebar-muted hover:bg-white/5 hover:text-expert-sidebar-foreground"
              }`}
            >
              <span>{item.label}</span>
              {count != null && count > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-5 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-expert-sidebar-muted">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                aria-hidden
              />
              Active
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-2">
          <span className="text-sm text-expert-sidebar-muted">Available</span>
          <button
            type="button"
            role="switch"
            aria-checked={available}
            onClick={() => setAvailable((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              available ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                available ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <form method="post" action="/api/expert/logout">
          <button
            type="submit"
            className="w-full rounded-lg border border-white/20 px-3 py-2.5 text-left text-sm font-medium text-expert-sidebar-muted transition-colors hover:border-white/35 hover:bg-white/5 hover:text-expert-sidebar-foreground"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export function ExpertPanelShell({
  user,
  navCounts,
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
        <aside className="hidden w-64 shrink-0 flex-col border-white/10 bg-expert-sidebar text-expert-sidebar-foreground lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:border-r">
          <div className="flex flex-1 flex-col px-4 pb-6 pt-8">
            <ExpertNavInner user={user} navCounts={navCounts} />
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
                  user={user}
                  navCounts={navCounts}
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
