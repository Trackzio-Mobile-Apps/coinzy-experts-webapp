"use client";

import type { InputHTMLAttributes } from "react";
import {
  EXPERT_PROFILE_DISPLAY,
  EXPERT_PROFILE_EXPERTISE_ALL_OPTIONS,
  EXPERT_PROFILE_EXPERTISE_SELECTED,
  EXPERT_PROFILE_FORM_DEFAULT,
  EXPERT_PROFILE_RATING,
  EXPERT_PROFILE_REVIEWS,
  EXPERT_PROFILE_STATS,
} from "@/data/expert-profile.mock";
import { formatInr } from "@/data/expert-panel.mock";
import { useMemo, useState } from "react";

const chipBase =
  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2";

const inputRead =
  "w-full rounded-lg border border-border bg-input-bg/60 px-3.5 py-2.5 text-sm text-text";
const inputEdit =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-[box-shadow,border-color] focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ExpertProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(EXPERT_PROFILE_FORM_DEFAULT.firstName);
  const [lastName, setLastName] = useState(EXPERT_PROFILE_FORM_DEFAULT.lastName);
  const [age, setAge] = useState(String(EXPERT_PROFILE_FORM_DEFAULT.age));
  const [country, setCountry] = useState(EXPERT_PROFILE_FORM_DEFAULT.country);
  const [bioPublic, setBioPublic] = useState(EXPERT_PROFILE_FORM_DEFAULT.bioPublic);
  const [expertise, setExpertise] = useState<Set<string>>(
    () => new Set(EXPERT_PROFILE_EXPERTISE_SELECTED),
  );

  const stats = EXPERT_PROFILE_STATS;
  const display = EXPERT_PROFILE_DISPLAY;

  const nextAddableCategory = useMemo(() => {
    return EXPERT_PROFILE_EXPERTISE_ALL_OPTIONS.find((t) => !expertise.has(t));
  }, [expertise]);

  function toggleExpertise(tag: string) {
    if (!isEditing) return;
    setExpertise((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function addNextCategory() {
    if (!nextAddableCategory) return;
    setExpertise((prev) => new Set(prev).add(nextAddableCategory));
  }

  function handleSave() {
    setIsEditing(false);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              My profile
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage your expert profile and account settings
            </p>
          </div>
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Save
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="shrink-0 rounded-lg border border-primary bg-transparent px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/[0.06]"
            >
              Edit profile
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total earnings"
            value={formatInr(stats.totalEarningsInr)}
            hint="Since Jan 2023"
            emphasis
          />
          <StatCard
            label="Pending earnings"
            value={formatInr(stats.pendingEarningsInr)}
            hint={stats.pendingHint}
          />
          <StatCard
            label="This month"
            value={formatInr(stats.thisMonthInr)}
            hint={`${stats.thisMonthCompleted} completed`}
          />
          <StatCard
            label="Past month"
            value={formatInr(stats.pastMonthInr)}
            hint={`${stats.pastMonthCompleted} completed`}
          />
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-border/60 pt-8 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
            {display.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold text-text">{display.fullName}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {display.tagline}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {display.headlineTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex rounded-full border border-border bg-input-bg/80 px-3 py-1 text-xs font-medium text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Personal information
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              isEditing={isEditing}
              value={firstName}
              onChange={setFirstName}
            />
            <Field
              label="Last name"
              isEditing={isEditing}
              value={lastName}
              onChange={setLastName}
            />
            <Field
              label="Age"
              isEditing={isEditing}
              value={age}
              onChange={setAge}
              inputMode="numeric"
            />
            <Field
              label="Country"
              isEditing={isEditing}
              value={country}
              onChange={setCountry}
            />
          </div>
        </div>

        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Public profile / visible to coin owners
          </p>
          <h2 className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text">
            Professional bio
          </h2>
          {isEditing ? (
            <textarea
              className={`${inputEdit} mt-3 min-h-[140px] resize-y`}
              value={bioPublic}
              onChange={(e) => setBioPublic(e.target.value)}
              rows={6}
            />
          ) : (
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-input-bg/40 px-3.5 py-3 text-sm leading-relaxed text-text">
              {bioPublic}
            </p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Expertise categories
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {EXPERT_PROFILE_EXPERTISE_ALL_OPTIONS.filter((tag) =>
              expertise.has(tag),
            ).map((tag) =>
              isEditing ? (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleExpertise(tag)}
                  className={`${chipBase} bg-primary text-white hover:bg-primary-hover`}
                >
                  {tag}
                </button>
              ) : (
                <span
                  key={tag}
                  className={`${chipBase} cursor-default bg-primary text-white`}
                >
                  {tag}
                </span>
              ),
            )}
            {isEditing && nextAddableCategory ? (
              <button
                type="button"
                onClick={addNextCategory}
                className={`${chipBase} border border-dashed border-primary/50 text-primary hover:bg-primary/[0.06]`}
              >
                + Add category
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text">
              Feedback &amp; reviews
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              What coin owners are saying about your evaluations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold tabular-nums text-text">
              {EXPERT_PROFILE_RATING.average}
            </span>
            <StarRow count={5} filled={5} />
            <span className="text-sm text-text-muted">
              {EXPERT_PROFILE_RATING.reviewCount} reviews
            </span>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-border/60">
          {EXPERT_PROFILE_REVIEWS.map((r) => (
            <li key={`${r.regId}-${r.author}`} className="py-6 first:pt-0">
              <p className="text-sm font-medium text-text">
                {r.author}{" "}
                <span className="font-normal text-text-muted">• {r.dateLabel}</span>
              </p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {r.regId} • {r.coinTitle}
              </p>
              <div className="mt-2">
                <StarRow count={5} filled={r.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-center">
          <button
            type="button"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View all reviews
          </button>
        </p>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 shadow-sm ${
        emphasis
          ? "border-primary/20 bg-primary/[0.07]"
          : "border-border/80 bg-surface"
      }`}
    >
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

function Field({
  label,
  value,
  onChange,
  isEditing,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = `profile-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.1em] text-text"
      >
        {label}
      </label>
      {isEditing ? (
        <input
          id={id}
          className={inputEdit}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
        />
      ) : (
        <div className={inputRead}>{value}</div>
      )}
    </div>
  );
}

function StarRow({ filled, count }: { filled: number; count: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={i < filled ? "text-amber-400" : "text-amber-200/70"}
        >
          ★
        </span>
      ))}
    </div>
  );
}
