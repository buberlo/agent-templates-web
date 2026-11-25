"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import {
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "@/lib/content/walkthrough-videos";

export function YoutubeLazyEmbed({
  youtubeId,
  title,
  watchOnYouTubeLabel,
  playLabel,
}: {
  youtubeId: string;
  title: string;
  watchOnYouTubeLabel: string;
  playLabel: string;
}) {
  const [active, setActive] = useState(false);
  const watchUrl = youtubeWatchUrl(youtubeId);
  const thumbnailUrl = youtubeThumbnailUrl(youtubeId);

  return (
    <div className="mt-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-surface">
        {active ? (
          <iframe
            title={title}
            src={`${youtubeEmbedUrl(youtubeId)}?autoplay=1`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center p-0"
            aria-label={playLabel}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
              loading="lazy"
            />
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-control bg-background/90 text-accent shadow-sm transition-colors group-hover:bg-background group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent">
              <Play size={26} fill="currentColor" aria-hidden className="ml-0.5" />
            </span>
          </button>
        )}
      </div>
      <p className="mt-2">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link text-sm"
        >
          {watchOnYouTubeLabel}
        </a>
      </p>
    </div>
  );
}