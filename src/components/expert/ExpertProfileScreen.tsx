"use client";

import { InputGroup } from "@/components/auth/InputGroup";
import { SelectGroup } from "@/components/auth/SelectGroup";
import {
  getCountries,
  resolveCountryCode,
  resolveCountryLabel,
  type Country,
} from "@/lib/expert/countriesService";
import { formatInr } from "@/lib/expert/format";
import {
  DEMO_REVIEWS,
  EXPERTISE_OPTIONS,
  getReviewSummary,
  loadExtendedProfile,
  saveExtendedProfile,
  type ExpertExtendedProfile,
} from "@/lib/expert/expertProfileExtended";
import { useExpertProfile } from "@/lib/expert/expertProfileStore";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  age: string;
  country: string;
  tagline: string;
  professionalBio: string;
  summaryTags: string[];
  expertiseCategories: string[];
};

function profileInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className={
            index < rating ? "text-amber-400" : "text-border"
          }
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function EarningsCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-text sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}

function TagPill({
  label,
  selected = false,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const base =
    "rounded-full px-3 py-1 text-xs font-medium transition-colors";
  const styles = onClick
    ? selected
      ? `${base} bg-primary text-white`
      : `${base} border border-border bg-surface text-text-muted hover:border-primary/40`
    : `${base} bg-input-bg text-text-muted`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={styles}>
        {label}
      </button>
    );
  }

  return <span className={styles}>{label}</span>;
}

function buildFormState(
  profile: { firstName: string; lastName: string },
  extended: ExpertExtendedProfile,
  countries: Country[],
): ProfileFormState {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    age: extended.age,
    country: resolveCountryCode(extended.country, countries),
    tagline: extended.tagline,
    professionalBio: extended.professionalBio,
    summaryTags: [...extended.summaryTags],
    expertiseCategories: [...extended.expertiseCategories],
  };
}

export function ExpertProfileScreen() {
  const { profile, isLoading, hydrateProfile } = useExpertProfile();
  const [extended, setExtended] = useState<ExpertExtendedProfile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextCountries = await getCountries();
        if (!cancelled) {
          setCountries(nextCountries);
          setCountriesError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setCountriesError(
            err instanceof Error ? err.message : "Unable to load countries.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    const loaded = loadExtendedProfile(profile.id);
    setExtended(loaded);
    setForm(buildFormState(profile, loaded, countries));
  }, [profile, countries]);

  const reviewSummary = useMemo(() => getReviewSummary(DEMO_REVIEWS), []);

  const earnings = useMemo(() => {
    if (!profile || !extended) {
      return {
        total: "—",
        pending: "—",
        thisMonth: "—",
        completedThisMonth: "—",
        memberSince: "Since Jan 2026",
        pendingHint: "—",
      };
    }

    const totalInr =
      profile.stats.totalEarningsInr > 0
        ? profile.stats.totalEarningsInr
        : extended.earnings.totalInr;
    const pendingInr = extended.earnings.pendingInr;
    const thisMonthInr = extended.earnings.thisMonthInr;
    const completed =
      extended.earnings.thisMonthCompleted > 0
        ? extended.earnings.thisMonthCompleted
        : profile.stats.completed;

    return {
      total: totalInr > 0 ? formatInr(totalInr) : "—",
      pending: pendingInr > 0 ? formatInr(pendingInr) : "—",
      thisMonth: thisMonthInr > 0 ? formatInr(thisMonthInr) : "—",
      completedThisMonth: completed > 0 ? String(completed) : "—",
      memberSince: extended.earnings.memberSinceLabel,
      pendingHint:
        extended.earnings.pendingReviewCount > 0
          ? `${extended.earnings.pendingReviewCount} evaluations in review`
          : "No pending payouts",
    };
  }, [profile, extended]);

  const handleStartEdit = useCallback(() => {
    if (!profile || !extended) return;
    setForm(buildFormState(profile, extended, countries));
    setIsEditing(true);
    setSaveMessage(null);
  }, [profile, extended, countries]);

  const handleCancelEdit = useCallback(() => {
    if (!profile || !extended) return;
    setForm(buildFormState(profile, extended, countries));
    setIsEditing(false);
    setSaveMessage(null);
  }, [profile, extended, countries]);

  const handleSave = useCallback(() => {
    if (!profile || !extended || !form) return;

    const nextExtended: ExpertExtendedProfile = {
      ...extended,
      age: form.age.trim(),
      country: form.country.trim(),
      tagline: form.tagline.trim(),
      professionalBio: form.professionalBio.trim(),
      summaryTags: form.summaryTags,
      expertiseCategories: form.expertiseCategories,
    };

    saveExtendedProfile(profile.id, nextExtended);
    setExtended(nextExtended);

    hydrateProfile({
      ...profile,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    });

    setIsEditing(false);
    setSaveMessage("Profile updated.");
  }, [profile, extended, form, hydrateProfile]);

  const toggleExpertise = (tag: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const has = prev.expertiseCategories.includes(tag);
      return {
        ...prev,
        expertiseCategories: has
          ? prev.expertiseCategories.filter((item) => item !== tag)
          : [...prev.expertiseCategories, tag],
      };
    });
  };

  if (isLoading || !profile || !extended || !form) {
    return <p className="text-sm text-text-muted">Loading profile…</p>;
  }

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");
  const initials = profileInitials(form.firstName, form.lastName);
  const countryDisplay = resolveCountryLabel(form.country, countries);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            My profile
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your expert profile and account settings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveMessage && !isEditing ? (
            <p className="text-sm text-emerald-700" role="status">
              {saveMessage}
            </p>
          ) : null}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-input-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Save changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <EditIcon />
              Edit profile
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EarningsCard
          label="Total earnings"
          value={earnings.total}
          hint={earnings.memberSince}
        />
        <EarningsCard
          label="Pending earnings"
          value={earnings.pending}
          hint={earnings.pendingHint}
        />
        <EarningsCard
          label="This month"
          value={earnings.thisMonth}
          hint={
            earnings.completedThisMonth !== "—"
              ? `${earnings.completedThisMonth} completed`
              : "No completions yet"
          }
        />
        <EarningsCard
          label="Completed"
          value={
            profile.stats.completed > 0
              ? String(profile.stats.completed)
              : "—"
          }
          hint="All-time evaluations"
        />
      </div>

      <section className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-input-bg text-2xl font-semibold text-text-muted">
              {initials}
            </span>
            {isEditing ? (
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-sm transition-colors hover:text-text"
                aria-label="Change profile photo"
              >
                <CameraIcon />
              </button>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="text-xl font-semibold text-text">{fullName || "—"}</h2>
            {isEditing ? (
              <textarea
                value={form.tagline}
                onChange={(e) =>
                  setForm((prev) =>
                    prev ? { ...prev, tagline: e.target.value } : prev,
                  )
                }
                rows={2}
                placeholder="Short professional tagline"
                className="w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-[box-shadow,border-color] placeholder:text-text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="text-sm leading-relaxed text-text-muted">
                {form.tagline || "Add a short tagline about your expertise."}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {form.summaryTags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Personal information{" "}
              <span className="font-normal text-text-muted">(private)</span>
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InputGroup
                label="First name"
                id="profile-first-name"
                labelUppercase
                inputTone="surface"
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) =>
                    prev ? { ...prev, firstName: e.target.value } : prev,
                  )
                }
                readOnly={!isEditing}
                className={!isEditing ? "pointer-events-none opacity-90" : ""}
              />
              <InputGroup
                label="Last name"
                id="profile-last-name"
                labelUppercase
                inputTone="surface"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) =>
                    prev ? { ...prev, lastName: e.target.value } : prev,
                  )
                }
                readOnly={!isEditing}
                className={!isEditing ? "pointer-events-none opacity-90" : ""}
              />
              <InputGroup
                label="Age"
                id="profile-age"
                labelUppercase
                inputTone="surface"
                inputMode="numeric"
                value={form.age}
                onChange={(e) =>
                  setForm((prev) =>
                    prev ? { ...prev, age: e.target.value } : prev,
                  )
                }
                readOnly={!isEditing}
                placeholder={isEditing ? "e.g. 45" : "—"}
                className={!isEditing ? "pointer-events-none opacity-90" : ""}
              />
              {isEditing ? (
                <SelectGroup
                  label="Country"
                  id="profile-country"
                  labelUppercase
                  inputTone="surface"
                  value={form.country}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, country: e.target.value } : prev,
                    )
                  }
                  disabled={countries.length === 0}
                  placeholder={
                    countries.length === 0
                      ? "Loading countries…"
                      : "Select country"
                  }
                  error={countriesError ?? undefined}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </SelectGroup>
              ) : (
                <InputGroup
                  label="Country"
                  id="profile-country"
                  labelUppercase
                  inputTone="surface"
                  value={countryDisplay}
                  readOnly
                  placeholder="—"
                  className="pointer-events-none opacity-90"
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text">
              Public profile{" "}
              <span className="font-normal text-text-muted">
                (visible to coin owners)
              </span>
            </h3>
            <div className="mt-4">
              <label
                htmlFor="profile-bio"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-text"
              >
                Professional bio
              </label>
              <textarea
                id="profile-bio"
                value={form.professionalBio}
                onChange={(e) =>
                  setForm((prev) =>
                    prev
                      ? { ...prev, professionalBio: e.target.value }
                      : prev,
                  )
                }
                readOnly={!isEditing}
                rows={5}
                placeholder={
                  isEditing
                    ? "Describe your background, credentials, and areas of focus…"
                    : "No professional bio added yet."
                }
                className={`mt-1.5 w-full resize-y rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-[box-shadow,border-color] placeholder:text-text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  !isEditing ? "pointer-events-none opacity-90" : ""
                }`}
              />
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text">
                Expertise categories
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((tag) => (
                  <TagPill
                    key={tag}
                    label={tag}
                    selected={form.expertiseCategories.includes(tag)}
                    onClick={isEditing ? () => toggleExpertise(tag) : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <StarRating rating={Math.round(reviewSummary.average)} />
            <span className="text-sm text-text-muted">
              {reviewSummary.count} reviews
            </span>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-border/60">
          {DEMO_REVIEWS.map((review) => (
            <li key={review.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">
                    {review.reviewerName}
                    <span className="font-normal text-text-muted">
                      {" "}
                      · {review.dateLabel}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {review.requestId} · {review.coinName}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-6 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          View all reviews →
        </button>
      </section>
    </div>
  );
}
