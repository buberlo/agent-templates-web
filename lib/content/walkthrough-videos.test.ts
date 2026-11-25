import assert from "node:assert/strict";
import test from "node:test";
import {
  WALKTHROUGH_VIDEO_IDS,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from "./walkthrough-videos";

test("walkthrough video URLs use privacy-friendly embed and watch links", () => {
  const grokId = WALKTHROUGH_VIDEO_IDS.grokbot;
  assert.equal(
    youtubeEmbedUrl(grokId),
    `https://www.youtube-nocookie.com/embed/${grokId}`,
  );
  assert.equal(youtubeWatchUrl(grokId), `https://www.youtube.com/watch?v=${grokId}`);
  assert.equal(youtubeThumbnailUrl(grokId), `https://i.ytimg.com/vi/${grokId}/hqdefault.jpg`);
});