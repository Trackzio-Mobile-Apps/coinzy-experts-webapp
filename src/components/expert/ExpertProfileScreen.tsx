"use client";

import { ExpertAvatar } from "@/components/expert/ExpertAvatar";
import { ExpertEmptyState } from "@/components/expert/ExpertEmptyState";
import { ExpertProfileSkeleton } from "@/components/expert/ExpertSkeleton";
import {
  getCountries,
  resolveCountryLabel,
  type Country,
} from "@/lib/expert/countriesService";
import { getReviewSummary, type ExpertReview } from "@/lib/expert/expertProfileExtended";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import { useEffect, useState } from "react";

function profileInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

function formatSupportedCountries(
  codes: string[],
  countries: Country[],
): string {
  if (codes.length === 0) return "All countries";
  return codes
    .map((code) => resolveCountryLabel(code, countries))
    .join(", ");
}

export function ExpertProfileScreen() {
  const { profile, isLoading } = useExpertProfile();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextCountries = await getCountries();
        if (!cancelled) setCountries(nextCountries);
      } catch {
        // Country labels fall back to raw ISO codes.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const reviews: ExpertReview[] = [];
  const reviewSummary = getReviewSummary(reviews);

  if (isLoading || !profile) {
    return <ExpertProfileSkeleton />;
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  const initials = profileInitials(profile.firstName, profile.lastName);
  const countryDisplay = formatSupportedCountries(
    profile.supportedCountries,
    countries,
  );
  const tagline = profile.oneLineDescription?.trim() ?? "";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          My profile
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Your account details from the expert portal
        </p>
      </header>

      <section className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ExpertAvatar
            profilePicture={profile.profilePicture}
            initials={initials}
            name={fullName}
            size="md"
          />

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-text">
                {fullName || "—"}
              </h2>
              {tagline ? (
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {tagline}
                </p>
              ) : null}
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-text">{profile.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Supported countries
                </dt>
                <dd className="mt-1 text-sm text-text">{countryDisplay}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Availability
                </dt>
                <dd className="mt-1 text-sm text-text">
                  {profile.isAvailableForRequests
                    ? "Accepting new requests"
                    : "Not accepting new requests"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Account status
                </dt>
                <dd className="mt-1 text-sm capitalize text-text">
                  {profile.status || "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {reviews.length === 0 ? (
        <section className="rounded-2xl border border-border/70 bg-surface shadow-sm">
          <ExpertEmptyState
            title="No Reviews Yet"
            description="Reviews from your completed evaluations will appear here."
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">
                Feedback &amp; reviews
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                What coin owners are saying about your evaluations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-text">
                {reviewSummary.average}
              </span>
              <span className="text-sm text-text-muted">
                {reviewSummary.count} reviews
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
