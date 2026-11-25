export const WALKTHROUGH_VIDEO_IDS = {
  grokbot: "qfbQNrdKMkk",
  hermes: "k77BTri5J-w",
} as const;

export type WalkthroughVideoKey = keyof typeof WALKTHROUGH_VIDEO_IDS;

export const WALKTHROUGH_UPLOAD_DATE = "2026-11-25";

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function youtubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}

export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}