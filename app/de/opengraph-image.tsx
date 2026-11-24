import { catalogOgImage } from "@/lib/views/og-image";
import { ogHomeContent } from "@/lib/views/og-home";

export const alt = "Agent Templates";
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const { brand, title, stats } = ogHomeContent("de");
  return catalogOgImage({ brand, title, caption: stats }, size);
}
