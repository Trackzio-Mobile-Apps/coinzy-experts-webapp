"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type QueueCoinPreviewProps = {
  coinName: string;
  thumbnailUrls: string[];
};

function CoinPairInitials({ label }: { label: string }) {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 text-[10px] font-bold text-white shadow-sm"
      aria-hidden
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

const thumbClass =
  "h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-sm";

export function QueueCoinPreview({
  coinName,
  thumbnailUrls,
}: QueueCoinPreviewProps) {
  const urls = useMemo(
    () =>
      thumbnailUrls
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, 2),
    [thumbnailUrls],
  );

  const [failed, setFailed] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setFailed(new Set());
  }, [urls]);

  const markFailed = useCallback((index: number) => {
    setFailed((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const visibleUrls = urls.filter((_, index) => !failed.has(index));

  if (visibleUrls.length === 0) {
    return <CoinPairInitials label={coinName} />;
  }

  if (visibleUrls.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote coin media URLs
      <img
        src={visibleUrls[0]}
        alt={coinName}
        className={thumbClass}
        onError={() => markFailed(urls.indexOf(visibleUrls[0]!))}
      />
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2" aria-hidden>
      {visibleUrls.map((src) => {
        const sourceIndex = urls.indexOf(src);
        return (
          // eslint-disable-next-line @next/next/no-img-element -- remote coin media URLs
          <img
            key={`${sourceIndex}-${src}`}
            src={src}
            alt=""
            className={thumbClass}
            onError={() => markFailed(sourceIndex)}
          />
        );
      })}
    </div>
  );
}
